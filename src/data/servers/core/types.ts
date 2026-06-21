export type RegionKey = "eu" | "na" | "sa" | "asia" | "oce" | "af" | "me";

export type RegionDefinition = {
  key: RegionKey;
  label: string;
};

export type ServerLinks = {
  steam?: string;
  discord?: string;
  website?: string;
};

export type ServerDefinition = {
  name: string;
  region: RegionKey;
  ip: string;
  countryOverride?: string;
};

export type CommunityDefinition = {
  name: string;
  links?: ServerLinks;
  servers: ServerDefinition[];
};

export type Server = ServerDefinition & {
  id: number;
  country?: string;
};

export type ServerGroup = {
  name: string;
  links?: ServerLinks;
  servers: Server[];
};

export type ServerRegion = RegionDefinition & {
  groups: ServerGroup[];
  serverCount: number;
};

export type BattleMetricsMetadata = {
  id: number;
  country?: string;
};

export type BattleMetricsCache = Record<string, BattleMetricsMetadata>;
