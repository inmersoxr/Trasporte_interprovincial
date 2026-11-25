// Pilot review checklist; documentary acceptance is a manual platform decision.
// This is not a certification of Ecuador's complete legal requirements.
export const documentKinds=[
 {kind:'identity',label:'Identificación del prestador',subject:'operator',expiry:false},
 {kind:'authorization',label:'Habilitación para el servicio declarado',subject:'operator',expiry:false},
 {kind:'license',label:'Licencia del conductor',subject:'driver',expiry:true},
 {kind:'registration',label:'Matrícula del vehículo',subject:'vehicle',expiry:false},
 {kind:'insurance',label:'Cobertura o seguro aplicable',subject:'vehicle',expiry:true},
 {kind:'inspection',label:'Revisión del vehículo',subject:'vehicle',expiry:true},
 {kind:'driver_photo',label:'Fotografía del conductor',subject:'driver',expiry:false,optional:true,photo:true},
 {kind:'vehicle_photo',label:'Fotografía del vehículo',subject:'vehicle',expiry:false,optional:true,photo:true},
];
