import type { Phone, SpecKey } from "@/types/battle";
import type { MobileApiDevice } from "./mobileapi";

function maxStorage(text?:string){const vals=[...(text??"").matchAll(/(\d+(?:\.\d+)?)\s*(TB|GB)/gi)].map(m=>Number(m[1])*(m[2].toUpperCase()==="TB"?1024:1));return vals.length?Math.max(...vals):null}
function megapixels(text?:string){const vals=[...(text??"").matchAll(/(\d+(?:\.\d+)?)\s*MP/gi)].map(m=>Number(m[1]));return vals.length?Math.max(...vals):null}
function resolutionPixels(text?:string){const m=text?.replace(/,/g,"").match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);return m?Number(m[1])*Number(m[2]):null}
function batteryMah(text?:string){const m=text?.replace(/,/g,"").match(/(\d{3,5})\s*mAh/i);return m?Number(m[1]):null}
function performanceScore(text?:string){const t=(text??"").toLowerCase();if(/a18\s*pro|snapdragon\s*8\s*elite/.test(t))return 100;if(/a18|snapdragon\s*8\s*gen\s*3|dimensity\s*9400/.test(t))return 97;if(/a17|snapdragon\s*8\s*gen\s*2|dimensity\s*9300/.test(t))return 94;if(/a16|snapdragon\s*8\s*gen\s*1/.test(t))return 91;return null}
function scale(spec:SpecKey,d:MobileApiDevice){switch(spec){case"performance":return performanceScore(d.hardware);case"camera":{const v=megapixels(d.camera);return v===null?null:Math.min(100,50+v*1.25)}case"display":{const v=resolutionPixels(d.screen_resolution);return v===null?null:Math.min(100,Math.sqrt(v)/40)}case"battery":{const v=batteryMah(d.battery_capacity);return v===null?null:Math.min(100,45+v/20)}case"storage":{const v=maxStorage(d.storage);return v===null?null:Math.min(100,40+v/10)}case"connectivity":return /5g/i.test(`${d.hardware} ${d.name}`)?90:null}}
}
export function normalizeDevice(d:MobileApiDevice,bundle:Record<string,Record<string,unknown>|null>={}):Phone{
 const p=bundle.platform;const disp=bundle.display;const mem=bundle.memory;const cam=bundle["main-camera"];const bat=bundle.battery;const net=bundle.network;const comms=bundle.comms;
 const raw:MobileApiDevice={...d,hardware:`${String(p?.chipset??p?.cpu??d.hardware??"")} ${String(net?.technology??"")} ${String(comms?.wlan??"")}`,screen_resolution:String(disp?.resolution??d.screen_resolution??""),camera:String(cam?.modules??d.camera??""),battery_capacity:String(bat?.capacity??d.battery_capacity??""),storage:String(mem?.internal??d.storage??"")};
 return {id:String(d.id),name:d.name,brand:d.brand_name??d.manufacturer_name??"Unknown",image:d.image_url,specs:{performance:scale("performance",raw)??0,camera:scale("camera",raw)??0,display:scale("display",raw)??0,battery:scale("battery",raw)??0,storage:scale("storage",raw)??0,connectivity:scale("connectivity",raw)??0}};
}
