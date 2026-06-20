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
  id: number;
  region: RegionKey;
  ip: string;
};

export type CommunityDefinition = {
  name: string;
  links?: ServerLinks;
  servers: ServerDefinition[];
};

export type Server = ServerDefinition & ServerLinks & {
  community: string;
};

export type ServerRegion = RegionDefinition & {
  servers: Server[];
};
