import { lookup } from "node:dns/promises";
import { readFile, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serverDefinitions } from "../src/data/servers/definitions";
import type { BattleMetricsCache, BattleMetricsMetadata } from "../src/data/servers/core/types";

type ResolvedServer = {
  name: string;
  address: string;
  host: string;
  port: number;
};

type BattleMetricsResponse = {
  data?: Array<{
    id?: string;
    attributes?: {
      ip?: string;
      port?: number;
      country?: string;
    };
  }>;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cachePath = resolve(root, "src/data/servers/generated/battlemetrics.json");
const userAgent = "VanillaFortressBattleMetricsResolver/1.0";
const refresh = process.argv.includes("--refresh");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readCache = async (): Promise<Record<string, unknown>> => {
  try {
    const parsed: unknown = JSON.parse(await readFile(cachePath, "utf8"));
    if (!isRecord(parsed)) throw new Error("BattleMetrics cache root must be an object");
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
};

const readCachedMetadata = (value: unknown): BattleMetricsMetadata | undefined => {
  if (!isRecord(value)) return undefined;
  if (typeof value.id !== "number" || !Number.isSafeInteger(value.id) || value.id < 1) {
    return undefined;
  }
  if (value.country !== undefined && (typeof value.country !== "string" || !/^[a-z]{2}$/.test(value.country))) {
    return undefined;
  }
  return value as BattleMetricsMetadata;
};

const parseAddress = (address: string) => {
  const separator = address.lastIndexOf(":");
  const host = address.slice(0, separator).replace(/^\[|\]$/g, "");
  const port = Number(address.slice(separator + 1));
  return { host, port };
};

const readServers = (): ResolvedServer[] =>
  serverDefinitions.flatMap((community) =>
    community.servers.map((server) => ({
      name: `${community.name} > ${server.name}`,
      address: server.ip,
      ...parseAddress(server.ip),
    })),
  );

const expectedHosts = async (host: string): Promise<Set<string>> => {
  const hosts = new Set([host.toLowerCase()]);
  if (isIP(host)) return hosts;

  try {
    const addresses = await lookup(host, { all: true });
    addresses.forEach(({ address }) => hosts.add(address.toLowerCase()));
  } catch {
    // BattleMetrics may still return the configured hostname directly.
  }

  return hosts;
};

const findBattleMetricsMetadata = async (server: ResolvedServer): Promise<BattleMetricsMetadata> => {
  const url = new URL("https://api.battlemetrics.com/servers");
  url.searchParams.set("filter[search]", server.address);
  url.searchParams.set("filter[game]", "tf2");
  url.searchParams.set("page[size]", "20");

  const response = await fetch(url, {
    headers: { "User-Agent": userAgent },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`BattleMetrics returned ${response.status} for ${server.address}`);
  }

  const hosts = await expectedHosts(server.host);
  const json = (await response.json()) as BattleMetricsResponse;
  const match = (json.data ?? []).find((candidate) => {
    const attributes = candidate.attributes ?? {};
    const candidateHost = attributes.ip?.replace(/^\[|\]$/g, "").toLowerCase();
    return candidateHost !== undefined && hosts.has(candidateHost) && Number(attributes.port) === server.port;
  });

  const id = Number(match?.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error(`No exact BattleMetrics match found for ${server.name} (${server.address})`);
  }

  const country = match?.attributes?.country?.toLowerCase();
  return {
    id,
    country: country && /^[a-z]{2}$/.test(country) ? country : undefined,
  };
};

const sortMetadata = (metadata: BattleMetricsCache): BattleMetricsCache =>
  Object.fromEntries(Object.entries(metadata).sort(([left], [right]) => left.localeCompare(right, "en")));

const main = async () => {
  const servers = readServers();
  const cachedValues = await readCache();
  const resolvedMetadata: BattleMetricsCache = {};
  const unresolved: string[] = [];
  let fetched = 0;

  for (const server of servers) {
    const cached = readCachedMetadata(cachedValues[server.address]);
    if (cached && !refresh) {
      resolvedMetadata[server.address] = cached;
      continue;
    }

    try {
      const resolved = await findBattleMetricsMetadata(server);
      resolvedMetadata[server.address] = {
        ...resolved,
        country: resolved.country ?? cached?.country,
      };
      fetched += 1;
      console.log(`Resolved ${server.name}: ${server.address} -> ${resolved.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (cached) {
        resolvedMetadata[server.address] = cached;
        console.warn(`${message}; using cached ID ${cached.id}`);
      } else {
        unresolved.push(`${server.name} (${server.address}): ${message}`);
      }
    }
  }

  if (unresolved.length > 0) {
    throw new Error(`Could not resolve BattleMetrics metadata:\n${unresolved.join("\n")}`);
  }

  const output = `${JSON.stringify(sortMetadata(resolvedMetadata), null, 2)}\n`;
  const previousOutput = await readFile(cachePath, "utf8").catch(() => "");
  if (output !== previousOutput) await writeFile(cachePath, output);

  console.log(`BattleMetrics metadata ready for ${servers.length} servers (${fetched} fetched).`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
