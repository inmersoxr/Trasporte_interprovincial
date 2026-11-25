export const vehicleTypes=[['auto','Automóvil'],['suv','SUV'],['van','Van'],['buseta','Buseta'],['minibus','Minibús'],['bus','Bus de un piso'],['double_decker','Bus de dos pisos']];
export const vehicleLabel=type=>vehicleTypes.find(([id])=>id===type)?.[1]||({minivan:'Minivan',other:'Otro vehículo'})[type]||type;
export const transportTypes=[['public','Público'],['private','Privado'],['commercial','Comercial']];
export const validVehicle=type=>vehicleTypes.some(([id])=>id===type)||['minivan','other'].includes(type);
export const legacyVehicle=type=>['auto','suv','van','minivan','other'].includes(type)?type:'other';
export function generateLayout(capacity,{columns=4,decks=1,aisleAfter=2}={}){const seats=[];let n=1;for(let deck=1;deck<=decks;deck++){const count=Math.floor(capacity/decks)+(deck<=capacity%decks?1:0);for(let i=0;i<count;i++){const column=i%columns+1;seats.push({number:n++,label:String(n-1),deck,row:Math.floor(i/columns)+1,column:column+(column>aisleAfter?1:0),position:column===1||column===columns?'window':column===aisleAfter||column===aisleAfter+1?'aisle':'middle',blocked:false});}}return{version:1,columns:columns+1,decks,aisleAfter,seats};}
