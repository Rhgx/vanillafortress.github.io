import { communities } from "./communities";
import { validateServerDirectory } from "./core/validate";
import { regions } from "./regions";
import type { RegionKey, Server, ServerRegion } from "./core/types";

export type {
  CommunityDefinition,
  RegionDefinition,
  RegionKey,
  Server,
  ServerDefinition,
  ServerLinks,
  ServerRegion,
} from "./core/types";

export const serverDefinitions = validateServerDirectory(communities, regions);

export const getServersByRegion = (region: RegionKey): Server[] =>
  serverDefinitions.flatMap((community) =>
    community.servers
      .filter((server) => server.region === region)
      .map((server) => ({
        ...server,
        ...community.links,
        community: community.name,
      })),
  );

export const serverRegions: ServerRegion[] = regions
  .map((region) => ({
    ...region,
    servers: getServersByRegion(region.key),
  }))
  .filter((region) => region.servers.length > 0);
