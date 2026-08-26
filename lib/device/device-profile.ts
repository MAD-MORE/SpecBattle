export type DeviceProfile = {
  platform: string;
  userAgent: string;
  screen: { width: number; height: number; pixelRatio: number; colorDepth: number };
  hardware: { logicalCores: number | null; memoryGB: number | null; touchPoints: number };
  capabilities: { webgl: boolean; webgpu: boolean; camera: boolean; microphone: boolean };
  battery: { supported: boolean; level: number | null; charging: boolean | null };
  network: { effectiveType: string | null; downlinkMbps: number | null; rttMs: number | null };
  collectedAt: string;
};

function canUseCamera() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

function hasWebGL() {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return !!canvas.getContext("webgl") || !!canvas.getContext("experimental-webgl");
}

export async function collectDeviceProfile(): Promise<DeviceProfile> {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; downlink?: number; rtt?: number }; gpu?: unknown };
  let battery: DeviceProfile["battery"] = { supported: false, level: null, charging: null };
  const getBattery = (nav as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery;
  if (getBattery) {
    try { const b = await getBattery.call(nav); battery = { supported: true, level: b.level, charging: b.charging }; } catch {}
  }
  const connection = nav.connection;
  return {
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    screen: { width: screen.width, height: screen.height, pixelRatio: devicePixelRatio, colorDepth: screen.colorDepth },
    hardware: { logicalCores: navigator.hardwareConcurrency ?? null, memoryGB: nav.deviceMemory ?? null, touchPoints: navigator.maxTouchPoints ?? 0 },
    capabilities: { webgl: hasWebGL(), webgpu: !!nav.gpu, camera: canUseCamera(), microphone: !!navigator.mediaDevices?.getUserMedia },
    battery,
    network: { effectiveType: connection?.effectiveType ?? null, downlinkMbps: connection?.downlink ?? null, rttMs: connection?.rtt ?? null },
    collectedAt: new Date().toISOString(),
  };
}
