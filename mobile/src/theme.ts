// Khidr design tokens — matches design/khidr-prototype.html.
export const theme = {
  colors: {
    ink: "#07130D",
    ink2: "#0B1A13",
    tray: "#0E2218",
    emerald: "#1F8060",
    cream: "#E8E0CD",
    creamDim: "rgba(232,224,205,0.58)",
    creamFaint: "rgba(232,224,205,0.32)",
    aqua: "#A9CCC7",
    aquaDeep: "#7FB3AC",
    line: "rgba(232,224,205,0.13)",
    lineStrong: "rgba(232,224,205,0.26)",
    danger: "#D98A82",
  },
  radius: 5,
  // font family keys registered in app/_layout.tsx
  font: {
    disp: "Caslon",
    body: "Serif",
    bodyMed: "SerifMed",
    bodySemi: "SerifSemi",
    bodyBold: "SerifBold",
  },
  space: (n: number) => n * 4,
};
export type Theme = typeof theme;
