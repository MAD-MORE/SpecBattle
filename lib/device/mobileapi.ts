export type MobileApiDevice={id:number;name:string;manufacturer_name?:string;brand_name?:string;model_numbers?:string;storage?:string;screen_resolution?:string;camera?:string;battery_capacity?:string;hardware?:string;image_url?:string;image_b64?:string;match_certainty?:string;match_type?:string};

const BASE_URL="https://api.mobileapi.dev";
function key(){const value=process.env.MOBILEAPI_KEY;if(!value)throw new Error("MOBILEAPI_KEY is not configured on the server");return value}
async function api(path:string){const res=await fetch(`${BASE_URL}${path}`,{headers:{Authorization:`Bearer ${key()}`},cache:"no-store"});if(!res.ok)throw new Error(`MobileAPI request failed (${res.status})`);return res.json()}
export async function searchDevices(input:{modelNumber?:string;name?:string}){const params=new URLSearchParams();if(input.modelNumber)params.set("model_number",input.modelNumber);else if(input.name)params.set("name",input.name);else throw new Error("A model number or name is required");params.set("exact","true");return api(`/devices/search/?${params.toString()}`) as Promise<{devices:MobileApiDevice[]}>}
export async function getDevice(id:number){return api(`/devices/${id}/`) as Promise<MobileApiDevice>}
export async function getSpecification(id:number,type:string){return api(`/devices/${id}/${type}/`) as Promise<Record<string,unknown>>}
export async function getDeviceBundle(id:number){const types=["platform","display","memory","main-camera","selfie-camera","battery","network","comms","features","misc"] as const;const results=await Promise.all(types.map(async type=>{try{return [type,await getSpecification(id,type)] as const}catch{return [type,null] as const}}));return Object.fromEntries(results)}
