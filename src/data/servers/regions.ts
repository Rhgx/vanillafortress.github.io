import type { RegionDefinition } from "./core/types";

export const regions = [
  { key: "eu", label: "Europe" },
  { key: "na", label: "North America" },
  { key: "sa", label: "South America" },
  { key: "asia", label: "Asia" },
  { key: "oce", label: "Oceania" },
  { key: "af", label: "Africa" },
  { key: "me", label: "Middle East" },
] as const satisfies readonly RegionDefinition[];
