import type { Phone } from "@/types/battle";
import { searchDevices, getDevice, getDeviceBundle } from "@/lib/device/mobileapi";
import { normalizeDevice } from "@/lib/device/normalize";

export interface PhoneProvider { search(query: string): Promise<Phone[]>; get(id: string): Promise<Phone | undefined>; }

export const mobileApiProvider: PhoneProvider = {
  async search(query) {
    if (!query.trim()) return [];
    const result = await searchDevices({ name: query, exact: false });
    return Promise.all(result.devices.map(async d => normalizeDevice(d, await getDeviceBundle(d.id))));
  },
  async get(id) {
    const device = await getDevice(Number(id));
    if (!device) return undefined;
    return normalizeDevice(device, await getDeviceBundle(device.id));
  },
};
