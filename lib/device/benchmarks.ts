import type { DeviceProfile } from "./device-profile";

export type MeasuredScores = Record<"performance"|"camera"|"display"|"battery"|"storage"|"connectivity", number|null>;

function clamp(n:number){return Math.max(0,Math.min(100,Math.round(n)))}
export function deriveScores(d:DeviceProfile):MeasuredScores{
  const performance=d.hardware.logicalCores===null?null:clamp(35+d.hardware.logicalCores*7+(d.hardware.memoryGB??0)*1.5);
  const display=clamp(Math.min(55,d.screen.width/24)+Math.min(25,d.screen.pixelRatio*9)+ (d.screen.colorDepth>=24?20:0));
  const connectivity=d.network.effectiveType===null?null:clamp(d.network.effectiveType==='4g'?85:d.network.effectiveType==='3g'?60:d.network.effectiveType==='2g'?35:50);
  const battery=d.battery.supported&&d.battery.level!==null?clamp(d.battery.level*100):null;
  return {performance,camera:d.capabilities.camera?null:null,display,battery,storage:null,connectivity};
}
