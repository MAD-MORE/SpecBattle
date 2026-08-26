import type { Phone, SpecKey } from "@/types/battle";
import type { MobileApiDevice } from "./mobileapi";

function number(text?:string){const m=text?.replace(/,/g,"").match(/(\d+(?:\.\d+)?)/);return m?Number(m[1]):null}
function maxStorage(text?:string){const vals=[...(text??"").matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)/gi)].map(m=>Number(m[1])*(m[2].toUpperCase()==="TB"?1024:1));return vals.length?Math.max(...vals):null}
function resolution(text?:string){const m=text?.replace(/,/g,"").match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);return m?Number(m[1])*Number(m[2]):null}
function mp(text?:string){const vals=[...(text??"").matchAll(/(\d+(?:\.\d+)?)\s*MP/gi)].map(m=>Number(m[1]));return vals.length?Math.max(...vals):null}
function battery(text?:string){const m=text?.replace(/,/g,"").match(/(\d{3,5})\s*mAh/i);return m?Number(m[1]):null}
function performance(text?:string){const t=(text??"").toLowerCase();if(/a18\s*pro/.test(t)||/snapdragon\s*8\s*elite/.test(t))return 100;if(/a18/.test(t)||/snapdragon\s*8\s*gen\s*3/.test(t)||/dimensity\s*9400/.test(t))return 97;if(/a17|snapdragon\s*8\s*gen\s*2|dimensity\s*9300/.test(t))return 94;if(/a16|snapdragon\s*8\s*gen\s*1/.test(t))return 91;return null}
function score(spec:SpecKey,d:MobileApiDevice){switch(spec){case"performance":return performance(d.hardware);case"camera":{const v=mp(d.camera);return v===null?null:Math.min(100,50+v*1.25)}case"display":{const r=resolution(d.screen_resolution);return r===null?null:Math.min(100,Math.sqrt(r)/40)}case"battery":{const v=battery(d.battery_capacity);return v===null?null:Math.min(100,45+v/20)}case"storage":{const v=maxStorage(d.storage);return v===null?null:Math.min(100,40+v/10)}case"connectivity":return /5g/i.test(`${d.hardware} ${d.name} ${d.description??""}`)?90:null}}
}
export function normalizeDevice(d:MobileApiDevice,bundle:Record<string,Record<string,unknown>|null>={}):Phone{
 const merged={...d};const p=bundle.platform as Record<string,unknown>|null;const disp=bundle.display as Record<string,unknown>|null;const mem=bundle.memory as Record<string,unknown>|null;const cam=bundle["main-camera"] as Record<string,unknown>|null;const bat=bundle.battery as Record<string,unknown>|null;const net=bundle.network as Record<string,unknown>|null;
 const raw={...merged,hardware:String(p?.chipset??p?.cpu??d.hardware??""),screen_resolution:String(disp?.resolution??d.screen_resolution??""),camera:String(cam?.modules??d.camera??""),battery_capacity:String(bat?.type??d.battery_capacity??""),storage:String(mem?.internal??d.storage??""),description:`${String(net?.technology??"")} ${String(net?.speed??"")}`};
 return {id:String(d.id),name:d.name,brand:d.brand_name??d.manufacturer_name??"Unknown",image:d.image_url,specs:{performance:score("performance",raw)??0,camera:score("camera",raw)??0,display:score("display",raw)??0,battery:score("battery",raw)??0,storage:score("storage",raw)??0,connectivity:score("connectivity",raw)??0}};
}
