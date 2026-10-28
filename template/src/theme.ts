import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  lapisDeep: "#070f24",
  lapis: "#13254f",
  lapisMid: "#203a73",
  gold: "#c9a24a",
  goldLight: "#ecd28c",
  goldDark: "#7d5f22",
  ivory: "#f1e7cc",
  ivoryDim: "rgba(241,231,204,0.72)",
  vermilion: "#c2412b",
  vermilionDark: "#7e2316",
  malachite: "#2f8a62",
  malachiteDark: "#17503a",
  silver: "#b9c3cf",
  ink: "#05080f",
};

export const F = {
  display: "Fell SC",
  displayItalic: "Fell",
  body: "Spectral",
};

let loaded: Promise<unknown> | null = null;
export const loadFonts = () => {
  if (!loaded) {
    loaded = Promise.all([
      loadFont({ family: F.display, url: staticFile("fonts/im-fell-english-sc-latin-400-normal.woff2") }),
      loadFont({ family: F.displayItalic, url: staticFile("fonts/im-fell-english-latin-400-italic.woff2"), style: "italic" }),
      loadFont({ family: F.body, url: staticFile("fonts/spectral-latin-300-normal.woff2"), weight: "300" }),
      loadFont({ family: F.body, url: staticFile("fonts/spectral-latin-400-normal.woff2"), weight: "400" }),
      loadFont({ family: F.body, url: staticFile("fonts/spectral-latin-500-normal.woff2"), weight: "500" }),
      loadFont({ family: F.body, url: staticFile("fonts/spectral-latin-600-normal.woff2"), weight: "600" }),
      loadFont({ family: F.body, url: staticFile("fonts/spectral-latin-400-italic.woff2"), weight: "400", style: "italic" }),
      loadFont({ family: F.body, url: staticFile("fonts/spectral-latin-500-italic.woff2"), weight: "500", style: "italic" }),
    ]);
  }
  return loaded;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
