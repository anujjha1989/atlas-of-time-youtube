// Plate coordinates of terrain.jpg: 120 px per degree, from 58°E / 43°N.
export const PX = 120;
export const PLATE_W = 4080, PLATE_H = 2760;
export const proj = (lon: number, lat: number): [number, number] => [(lon - 58) * PX, (43 - lat) * PX];

export const PLACES: Record<string, [number, number]> = {
  Kabul: [69.18, 34.53], Samarkand: [66.97, 39.65], Delhi: [77.21, 28.65], Panipat: [76.97, 29.39], Agra: [78.01, 27.18],
  Lahore: [74.34, 31.55], Peshawar: [71.57, 34.01], Multan: [71.47, 30.2], Qandahar: [65.7, 31.62], Ferghana: [71.78, 40.38],
  Andijan: [72.34, 40.78], Bajaur: [71.5, 34.78], Sialkot: [74.53, 32.49], Sirhind: [76.39, 30.64], Gwalior: [78.18, 26.22],
  Chittor: [74.65, 24.88], Khanwa: [77.53, 27.03], Jaunpur: [82.68, 25.75], Herat: [62.2, 34.35], Hisar: [75.72, 29.15],
  Attock: [72.24, 33.89], Milwat: [76.0, 31.4], Kannauj: [79.92, 27.05], Bayana: [77.29, 26.9], Sambhal: [78.57, 28.58], Mewat: [76.6, 27.55], Dholpur: [77.89, 26.7], Etawah: [79.02, 26.78], Kalpi: [79.73, 26.12], Bhira: [72.9, 32.48],
};

export type Cam = { lon: number; lat: number; zoom: number; tilt: number; rot?: number };
