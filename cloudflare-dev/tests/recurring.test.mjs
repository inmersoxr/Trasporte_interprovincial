import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';
import {planSchedule} from '../standard-recurring.mjs';
const DAY=86400000, allDays=[0,1,2,3,4,5,6];
const date=(offset=0)=>new Date(Date.now()-5*3600000+offset*DAY).toISOString().slice(0,10);
const plan=(extra={})=>({startDate:date(1),endDate:date(7),weekdays:allDays,times:['08:00'],durationMinutes:60,...extra});

test('recurrence uses Ecuador dates, weekdays and independent UTC instants, including leap days',()=>{
  const now=Date.parse('2026-11-18T12:00:00Z');
  const result=planSchedule(plan({startDate:'2026-11-19',endDate:'2026-11-25',weekdays:[1,2,3,4,5],times:['09:00','08:00']}),now);
  assert.equal(result.departures.length,10);
  assert.equal(result.departures[0].departAt,'2026-11-19T13:00:00.000Z');
  assert.equal(result.departures[1].departAt,'2026-11-19T14:00:00.000Z');
  assert.ok(result.departures.every(d=>![0,6].includes(new Date(d.startsAt-5*3600000).getUTCDay())));
  const leap=planSchedule(plan({startDate:'2028-02-29',endDate:'2028-03-01'}),Date.parse('2028-02-28T12:00:00Z'));
  assert.equal(leap.departures.length,2);
  const today=planSchedule(plan({startDate:'2026-11-18',endDate:'2026-11-18',times:['06:00','08:00']}),now);
  assert.equal(today.departures.length,1); // Only future departures are published.
});

test('recurrence rejects invalid calendars, oversized periods, duplicate times and vehicle overlaps',()=>{
  for(const extra of [{startDate:'2026-02-30'},{endDate:date(100)},{weekdays:[]},{weekdays:[1,1]},{weekdays:[7]},{times:['24:00']},{times:['08:00','08:00']},{times:['08:00','09:00'],durationMinutes:120},{durationMinutes:0},{times:['08:00','09:00','10:00'],endDate:date(31)},{timezone:'Pacific/Galapagos'}]) assert.throws(()=>planSchedule(plan(extra)),error=>error.status===400);
  assert.throws(()=>planSchedule(plan({startDate:date(1),endDate:date(2),times:['00:00','23:00'],durationMinutes:120})),/cruzan/);
});

async function fixture(){
  const r=await runtime(),a=(await r.call('/sessions',{})).data.token,b=(await r.call('/sessions',{})).data.token;
  const create=(path,body,token=a)=>r.call(path,{...body,requestId:body.requestId||crypto.randomUUID()},token);
  const operatorId=(await create('/operators',{name:'Operadora recurrente de prueba'})).data.id;
  const vehicleId=(await create('/vehicles',{operatorId,type:'van',model:'Vehículo de prueba',capacity:2})).data.id;
  const offerId=(await create('/route-offers',{operatorId,vehicleId,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500})).data.id;
  return {...r,a,b,create,operatorId,vehicleId,offerId,body:(extra={})=>({...plan(),operatorId,offerId,requestId:crypto.randomUUID(),...extra})};
}

test('recurring publication is persistent, idempotent and tenant-scoped; seats and single-date cancellation remain independent',async()=>{
  const f=await fixture();try{
    const body=f.body(),preview=await f.call('/recurring-schedules/preview',body,f.a);
    assert.equal(preview.status,200);assert.equal(preview.data.preview.count,7);
    assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM departures').first()).n,0);
    assert.equal((await f.call('/recurring-schedules',body,f.b)).status,403);
    const created=await f.call('/recurring-schedules',body,f.a);assert.equal(created.status,200);
    const id=created.data.schedule.id;
    assert.equal((await f.call('/recurring-schedules',body,f.a)).data.schedule.id,id);
    assert.equal((await f.call('/recurring-schedules',{...body,times:['10:00']},f.a)).status,409);
    assert.equal((await f.call('/recurring-schedules?operatorId='+f.operatorId,undefined,f.b)).status,403);
    assert.equal((await f.call('/recurring-schedules/'+id,undefined,f.b)).status,403);
    const list=await f.call('/recurring-schedules?operatorId='+f.operatorId,undefined,f.a);
    assert.equal(list.data.schedules[0].departureCount,7);
    let catalog=(await f.call('/catalog')).data.departures;
    assert.equal(catalog.length,7);assert.ok(catalog.every(d=>d.available===2));
    const booking=(await f.call('/bookings',{departureId:catalog[0].id,seatNumbers:[1],passengers:['Pasajero de prueba'],quotedPriceCents:1500,requestId:crypto.randomUUID()},f.b));assert.equal(booking.status,200);
    catalog=(await f.call('/catalog')).data.departures;
    assert.equal(catalog[0].available,1);assert.ok(catalog.slice(1).every(d=>d.available===2));
    const canceledId=catalog[1].id;
    assert.equal((await f.call('/operations',{operatorId:f.operatorId,kind:'departure',id:canceledId,action:'cancel'},f.a)).status,200);
    assert.equal((await f.call('/catalog')).data.departures.length,6);
    // Retrying the original publication cannot recreate a canceled occurrence.
    assert.equal((await f.call('/recurring-schedules',body,f.a)).data.schedule.id,id);
    assert.equal((await f.call('/catalog')).data.departures.length,6);
    const stop={operatorId:f.operatorId,action:'stop',requestId:crypto.randomUUID()};
    assert.equal((await f.call('/recurring-schedules/'+id,stop,f.b)).status,403);
    const stopped=await f.call('/recurring-schedules/'+id,stop,f.a);assert.equal(stopped.status,200);
    assert.equal(stopped.data.schedule.status,'stopped');assert.equal(stopped.data.schedule.retainedCount,1);
    assert.equal((await f.call('/recurring-schedules/'+id,stop,f.a)).status,200);
    catalog=(await f.call('/catalog')).data.departures;assert.equal(catalog.length,1);assert.equal(catalog[0].id,booking.data.booking.departure_id);
    assert.equal((await f.call('/bookings/'+booking.data.booking.id,undefined,f.b)).data.booking.status,'confirmed');
    assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM standard_vehicle_slots WHERE active=1').first()).n,1);
    assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM standard_operational_events WHERE event='recurring_cancelled_without_bookings'").first()).n,5);
  }finally{await f.mf.dispose();}
});

test('overlapping publications are all-or-nothing and do not leave orphan schedules or vehicle slots',async()=>{
  const f=await fixture();try{
    const first=f.body(),second=f.body();
    const race=await Promise.all([f.call('/recurring-schedules',first,f.a),f.call('/recurring-schedules',second,f.a)]);
    assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);
    assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM standard_recurring_schedules').first()).n,1);
    assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM departures').first()).n,7);
    assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM standard_vehicle_slots WHERE active=1').first()).n,7);
    // Collision late in a proposed period rejects the entire new period.
    const late=f.body({startDate:date(1),endDate:date(15)});
    assert.equal((await f.call('/recurring-schedules',late,f.a)).status,409);
    assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM departures').first()).n,7);
  }finally{await f.mf.dispose();}
});

test('90 departures publish in one bounded transaction; stopping and booking concurrently never cancel a confirmed ticket',async()=>{
  const f=await fixture();try{
    const body=f.body({endDate:date(90)}),created=await f.call('/recurring-schedules',body,f.a);
    assert.equal(created.status,200);assert.equal(created.data.schedule.departureCount,90);
    const id=created.data.schedule.id,departure=(await f.call('/catalog')).data.departures[0];
    const race=await Promise.all([
      f.call('/bookings',{departureId:departure.id,seatNumbers:[1],passengers:['Prueba concurrente'],quotedPriceCents:1500,requestId:crypto.randomUUID()},f.b),
      f.call('/recurring-schedules/'+id,{operatorId:f.operatorId,action:'stop',requestId:crypto.randomUUID()},f.a)
    ]);
    assert.equal(race[1].status,200);assert.ok([200,409].includes(race[0].status));
    const final=await f.db.prepare('SELECT status FROM departures WHERE id=?').bind(departure.id).first();
    assert.equal(final.status,race[0].status===200?'published':'cancelled');
    assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM bookings b JOIN departures d ON d.id=b.departure_id WHERE b.status='confirmed' AND d.status='cancelled'").first()).n,0);
    assert.equal((await f.call('/recurring-schedules',body,f.a)).data.schedule.status,'stopped');
  }finally{await f.mf.dispose();}
});

test('chosen daily and monthly frequencies preserve calendar days and skip nonexistent month dates',()=>{
 const now=Date.parse('2030-01-30T12:00:00Z');
 const body={startDate:'2030-01-31',endDate:'2030-03-31',weekdays:allDays,times:['08:00'],durationMinutes:60};
 const monthly=planSchedule({...body,frequency:'monthly'},now);
 assert.deepEqual(monthly.departures.map(d=>d.departAt.slice(0,10)),['2030-01-31','2030-03-31']);
 assert.equal(monthly.monthlyDay,31);
 assert.equal(planSchedule({...body,frequency:'daily',endDate:'2030-02-02',weekdays:[1]},now).departures.length,3);
 const weekly=planSchedule({...body,frequency:'weekly',endDate:'2030-02-14',weekdays:[4]},now);
 assert.equal(weekly.departures.length,3);
});
