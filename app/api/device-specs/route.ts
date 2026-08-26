import { NextRequest, NextResponse } from "next/server";
import { searchDevices, getDevice, getDeviceBundle } from "@/lib/device/mobileapi";
import { normalizeDevice } from "@/lib/device/normalize";

export async function GET(request:NextRequest){
  const model=request.nextUrl.searchParams.get("model")?.trim()||undefined;
  const name=request.nextUrl.searchParams.get("name")?.trim()||undefined;
  const deviceId=Number(request.nextUrl.searchParams.get("deviceId"));
  if(!model&&!name&&!Number.isFinite(deviceId)) return NextResponse.json({error:"model, name, or deviceId is required"},{status:400});
  try{
    const device=Number.isFinite(deviceId)&&deviceId>0?await getDevice(deviceId):((await searchDevices({modelNumber:model,name})).devices??[])[0];
    if(!device) return NextResponse.json({matched:false,error:"Device not found"},{status:404});
    const bundle=await getDeviceBundle(device.id);
    return NextResponse.json({matched:true,device:normalizeDevice(device,bundle),source:"MobileAPI.dev"},{headers:{"Cache-Control":"private, max-age=86400"}});
  }catch(error){
    const message=error instanceof Error?error.message:"Device lookup failed";
    return NextResponse.json({matched:false,error:message},{status:message.includes("MOBILEAPI_KEY")?503:502});
  }
}
