import rawBattleMetricsCache from "./generated/battlemetrics.json";
import { validateBattleMetricsCache } from "./core/validate";
import { serverDefinitions } from "./definitions";
import { regions } from "./regions";
import type { RegionKey, Server, ServerDefinition, ServerLinks, ServerRegion } from "./core/types";

export type {
  CommunityDefinition,
  RegionDefinition,
  RegionKey,
  Server,
  ServerDefinition,
  ServerLinks,
  ServerRegion,
} from "./core/types";

export { serverDefinitions } from "./definitions";

const battlemetricsCache = validateBattleMetricsCache(rawBattleMetricsCache, serverDefinitions);

const resolveServer = (
  server: ServerDefinition,
  community: string,
  links: ServerLinks | undefined,
): Server => {
  const { countryOverride, ...definition } = server;
  const battlemetrics = battlemetricsCache[server.ip];

  return {
    ...definition,
    ...links,
    community,
    id: battlemetrics.id,
    country: countryOverride ?? battlemetrics.country,
  };
};

export const getServersByRegion = (region: RegionKey): Server[] =>
  serverDefinitions.flatMap((community) =>
    community.servers
      .filter((server) => server.region === region)
      .map((server) => resolveServer(server, community.name, community.links)),
  );

export const serverRegions: ServerRegion[] = regions
  .map((region) => ({
    ...region,
    servers: getServersByRegion(region.key),
  }))
  .filter((region) => region.servers.length > 0);
