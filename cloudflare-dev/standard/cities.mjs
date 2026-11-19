// Reuses the approved demo's Ecuador city choices without importing its mock data.
export const cities=['Guayaquil','Cuenca','Machala','Loja','Manta','Portoviejo','Riobamba','Ambato','Babahoyo','Quito','Latacunga','Santo Domingo','Salinas','Milagro','Azogues','Esmeraldas'];
export const normalizeCity=value=>typeof value==='string'?value.trim().normalize('NFC'):'';
