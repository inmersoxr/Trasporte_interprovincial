import {dispatchPush} from './standard-notifications.mjs';
import {renewSchedules} from './standard-recurring.mjs';
export async function runJob(env,name,work){
 await env.DB.prepare('INSERT INTO standard_background_jobs(job,last_started) VALUES(?,CURRENT_TIMESTAMP) ON CONFLICT(job) DO UPDATE SET last_started=CURRENT_TIMESTAMP').bind(name).run();
 try{const result=await work();if(result?.failed)throw Error('Job incomplete');await env.DB.prepare("UPDATE standard_background_jobs SET last_success=CURRENT_TIMESTAMP,last_error='' WHERE job=?").bind(name).run();return result;}
 catch{await env.DB.prepare("UPDATE standard_background_jobs SET failures=failures+1,last_error='La tarea no se completó; revisa el servicio y vuelve a intentarlo.' WHERE job=?").bind(name).run();console.error('RutasEC background task failed: '+name);return{failed:true};}
}
export async function scheduledTasks(event,env){if(new Date(event.scheduledTime).getUTCMinutes()%5===0)await runJob(env,'recurring',()=>renewSchedules(env));else await runJob(env,'push',()=>dispatchPush(env));}
