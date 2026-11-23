// Contract for a future Capacitor foreground-service plugin, not a mock plugin.
export interface NativeGpsSample {
 id:string; lat:number; lng:number; accuracy:number;
 speed:number|null; heading:number|null; capturedAt:number;
}
export interface NativeGpsAdapter {
 requestPermissions():Promise<{fine:boolean;background:boolean;notifications:boolean}>;
 start(options:{tripId:string;minimumIntervalMs:5000;stationaryIntervalMs:10000}):Promise<void>;
 stop():Promise<void>;
 addListener(event:'position',listener:(sample:NativeGpsSample)=>void):Promise<{remove():Promise<void>}>;
 addListener(event:'state',listener:(state:{active:boolean;reason?:string})=>void):Promise<{remove():Promise<void>}>;
}
