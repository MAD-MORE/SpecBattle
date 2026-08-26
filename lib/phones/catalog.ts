import type { Phone } from "@/types/battle";

// Normalized reference data for the first real comparison pair.
// Raw manufacturer/spec-source values should be mapped into this 0-100 battle scale.
export const phoneCatalog: Phone[] = [
  { id: "samsung-galaxy-s25-ultra", name: "Galaxy S25 Ultra", brand: "Samsung", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra.jpg", specs: { performance: 96, camera: 97, display: 98, battery: 94, storage: 96, connectivity: 98 } },
  { id: "apple-iphone-16-pro-max", name: "iPhone 16 Pro Max", brand: "Apple", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg", specs: { performance: 98, camera: 95, display: 96, battery: 96, storage: 98, connectivity: 97 } },
];

export function getPhone(id: string) { return phoneCatalog.find((phone) => phone.id === id); }
