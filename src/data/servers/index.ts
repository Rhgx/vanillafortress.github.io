import rawBattleMetricsCache from "./generated/battlemetrics.json";
import { validateBattleMetricsCache } from "./core/validate";
import { serverDefinitions } from "./definitions";
import { regions } from "./regions";
import type { RegionKey, Server, ServerDefinition, ServerGroup, ServerRegion } from "./core/types";

export type {
  CommunityDefinition,
  RegionDefinition,
  RegionKey,
  Server,
  ServerDefinition,
  ServerGroup,
  ServerLinks,
  ServerRegion,
} from "./core/types";

export { serverDefinitions } from "./definitions";

const battlemetricsCache = validateBattleMetricsCache(rawBattleMetricsCache, serverDefinitions);

const resolveServer = (
  server: ServerDefinition,
): Server => {
  const { countryOverride, ...definition } = server;
  const battlemetrics = battlemetricsCache[server.ip];

  return {
    ...definition,
    countryOverride,
    id: battlemetrics.id,
    country: countryOverride ?? battlemetrics.country,
  };
};

const groupsForRegion = (region: RegionKey): ServerGroup[] =>
  serverDefinitions.flatMap((community) => {
    const servers = community.servers
      .filter((server) => server.region === region)
      .map((server) => resolveServer(server));

    return servers.length > 0
      ? [{ name: community.name, links: community.links, servers }]
      : [];
  });

export const getServersByRegion = (region: RegionKey): Server[] =>
  groupsForRegion(region).flatMap((group) => group.servers);

export const serverRegions: ServerRegion[] = regions
  .map((region) => {
    const groups = groupsForRegion(region.key);
    return {
      ...region,
      groups,
      serverCount: groups.reduce((total, group) => total + group.servers.length, 0),
    };
  })
  .filter((region) => region.serverCount > 0);
