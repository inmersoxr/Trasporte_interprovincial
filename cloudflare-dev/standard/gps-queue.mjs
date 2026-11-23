// Origin-local, account-separated queue. Never used as server truth.
export async function gpsQueue(key,update){
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('rutasec-gps',1);r.onupgradeneeded=()=>r.result.createObjectStore('queues');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction('queues','readwrite'),s=tx.objectStore('queues'),r=s.get(key);let value;r.onsuccess=()=>{value=(r.result||[]).filter(p=>p.capturedAt>Date.now()-86400000);if(update)value=update(value);value=value.filter(p=>p.capturedAt>Date.now()-86400000).slice(-20000);if(value.length)s.put(value,key);else s.delete(key);};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
export function gpsSample(position){const c=position.coords;return{id:crypto.randomUUID(),lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,speed:Number.isFinite(c.speed)?c.speed:null,heading:Number.isFinite(c.heading)?c.heading:null,capturedAt:Math.round(position.timestamp)};}
