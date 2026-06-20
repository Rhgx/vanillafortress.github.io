import type {
  CommunityDefinition,
  RegionDefinition,
  ServerDefinition,
  ServerLinks,
} from "./types";

const fail = (context: string, message: string): never => {
  throw new Error(`Invalid server configuration (${context}): ${message}`);
};

const validateName = (value: string, context: string) => {
  if (!value.trim()) fail(context, "name cannot be empty");
  if (value !== value.trim()) fail(context, "name cannot have leading or trailing whitespace");
};

const validateAddress = (server: ServerDefinition, context: string) => {
  const match = server.ip.match(/^(\[[0-9a-f:]+\]|[a-z0-9.-]+):(\d{1,5})$/i);
  if (!match) return fail(context, `invalid server address "${server.ip}"; expected "host:port"`);

  const port = Number(match[2]);
  if (port < 1 || port > 65_535) fail(context, `port ${port} is outside the valid range`);
};

const validateLinks = (links: ServerLinks | undefined, context: string) => {
  if (!links) return;

  Object.entries(links).forEach(([name, value]) => {
    if (!value) return;

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return fail(context, `invalid ${name} URL "${value}"`);
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      fail(context, `${name} URL must use HTTP or HTTPS`);
    }
  });
};

const validateServer = (server: ServerDefinition, context: string) => {
  validateName(server.name, context);
  validateAddress(server, context);

  if (!Number.isSafeInteger(server.id) || server.id < 1) {
    fail(context, `BattleMetrics ID "${server.id}" must be a positive integer`);
  }
};

export const validateServerDirectory = (
  communities: readonly CommunityDefinition[],
  regions: readonly RegionDefinition[],
): readonly CommunityDefinition[] => {
  const regionKeys = new Set<string>();
  const regionLabels = new Set<string>();

  regions.forEach((region) => {
    validateName(region.label, `region ${region.key}`);
    if (regionKeys.has(region.key)) fail("regions", `duplicate region key "${region.key}"`);
    if (regionLabels.has(region.label.toLowerCase())) {
      fail("regions", `duplicate region label "${region.label}"`);
    }
    regionKeys.add(region.key);
    regionLabels.add(region.label.toLowerCase());
  });

  const communityNames = new Set<string>();
  const addresses = new Set<string>();
  const battlemetricsIds = new Set<number>();

  communities.forEach((community) => {
    const communityContext = community.name || "unnamed community";
    validateName(community.name, communityContext);
    validateLinks(community.links, community.name);

    const normalizedCommunityName = community.name.toLowerCase();
    if (communityNames.has(normalizedCommunityName)) {
      fail("directory", `duplicate community "${community.name}"`);
    }
    communityNames.add(normalizedCommunityName);

    if (community.servers.length === 0) {
      fail(community.name, "community must contain at least one server");
    }

    community.servers.forEach((server) => {
      const context = `${community.name} > ${server.name || "unnamed server"}`;
      validateServer(server, context);

      if (!regionKeys.has(server.region)) fail(context, `unknown region "${server.region}"`);

      const normalizedAddress = server.ip.toLowerCase();
      if (addresses.has(normalizedAddress)) fail(context, `duplicate server address "${server.ip}"`);
      if (battlemetricsIds.has(server.id)) fail(context, `duplicate BattleMetrics ID "${server.id}"`);

      addresses.add(normalizedAddress);
      battlemetricsIds.add(server.id);
    });
  });

  return communities;
};
