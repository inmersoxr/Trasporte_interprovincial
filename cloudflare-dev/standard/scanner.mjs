// Camera lifecycle adapted from the existing demo; decoded codes go to D1.
// jsQR supplies the local fallback when BarcodeDetector is unavailable (e.g. Safari).
let decoder;
function localDecoder(){
 if(window.jsQR)return Promise.resolve(window.jsQR);
 decoder||=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/jsQR.js',import.meta.url).href;script.onload=()=>window.jsQR?resolve(window.jsQR):reject(new Error('No se pudo cargar el lector QR'));script.onerror=()=>{decoder=null;reject(new Error('No se pudo cargar el lector QR. Revisa la conexión.'));};document.head.append(script);});
 return decoder;
}
export function cameraScanner({video,state,startButton,stopButton,onCode}){
 let stream=null,timer=null,generation=0;
 function stop(){generation++;clearTimeout(timer);timer=null;stream?.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null;video.hidden=true;stopButton.hidden=true;startButton.disabled=false;}
 async function start(){
  stop();const turn=++generation;startButton.disabled=true;stopButton.hidden=false;state.textContent='Abriendo cámara…';
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('La cámara no está disponible. Puedes ingresar el código del boleto.');
   let native=null,decode=null;try{if(window.BarcodeDetector)native=new BarcodeDetector({formats:['qr_code']});}catch{}
   if(!native)decode=await localDecoder();
   const opened=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
   if(turn!==generation){opened.getTracks().forEach(track=>track.stop());return;}
   stream=opened;video.hidden=false;video.muted=true;video.playsInline=true;video.srcObject=stream;await video.play();
   if(turn!==generation)return;
   state.textContent='Apunta al QR del pasajero. La validación requiere conexión.';
   const canvas=document.createElement('canvas'),context=canvas.getContext('2d',{willReadFrequently:true});
   async function scan(){
    if(turn!==generation)return;
    try{
     let code=null;
     if(video.readyState>=2&&video.videoWidth){
      if(native){try{code=(await native.detect(video))[0]?.rawValue;}catch{native=null;decode=await localDecoder();}}
      if(!native){const scale=Math.min(1,640/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);context.drawImage(video,0,0,canvas.width,canvas.height);const pixels=context.getImageData(0,0,canvas.width,canvas.height);code=decode(pixels.data,canvas.width,canvas.height,{inversionAttempts:'dontInvert'})?.data;}
     }
     if(turn!==generation)return;
     if(code){stop();state.textContent='Validando boleto con el servidor…';await onCode(code);return;}
     timer=setTimeout(scan,200);
    }catch(error){if(turn===generation){stop();state.textContent=error.message;}}
   }
   await scan();
  }catch(error){if(turn===generation){stop();state.textContent=error.name==='NotAllowedError'?'Permite la cámara en el navegador o ingresa el código del boleto.':error.message;}}
 }
 stopButton.onclick=()=>{stop();state.textContent='Cámara cerrada.';};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
 return{start,stop};
}
