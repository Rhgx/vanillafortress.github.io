# Adding servers and communities

The server directory is defined in TypeScript under
[`communities`](./communities). BattleMetrics IDs and countries are resolved
automatically from each server address during development and builds.

Do not edit [`generated/battlemetrics.json`](./generated/battlemetrics.json) by
hand.

## Add a server to an existing community

1. Open the community's file in [`communities`](./communities).
2. Add the server to its `servers` array:

   ```ts
   {
     name: "Example Server",
     region: "eu",
     ip: "server.example.com:27015",
   }
   ```

3. Resolve its BattleMetrics metadata:

   ```sh
   npm run resolve:servers
   ```

4. Commit both the community file and the updated generated metadata.

## Add a community

Create a kebab-case TypeScript file in [`communities`](./communities), such as
`example-community.ts`:

```ts
import type { CommunityDefinition } from "../core/types";

export default {
  name: "Example Community",
  links: {
    website: "https://example.com",
    steam: "https://steamcommunity.com/groups/example",
    discord: "https://discord.gg/example",
  },
  servers: [
    {
      name: "Example Community EU",
      region: "eu",
      ip: "server.example.com:27015",
    },
  ],
} satisfies CommunityDefinition;
```

All links are optional. Remove the `links` object or any unused entries rather
than leaving empty strings.

Import the new definition in [`communities/index.ts`](./communities/index.ts)
and add it to the `communities` array. Its position in that array controls its
display order within each region.

Then run:

```sh
npm run resolve:servers
npm run check
npm run build
```

## Server fields

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Display name with no leading or trailing whitespace. |
| `region` | Yes | One of `eu`, `na`, `sa`, `asia`, `oce`, `af`, or `me`. |
| `ip` | Yes | Unique address in `host:port` format. Bracketed IPv6 is supported. |
| `countryOverride` | No | Lowercase two-letter country code when BattleMetrics reports the wrong country. |

Community names and server addresses must be unique across the directory. Each
community must contain at least one server. Community links must use HTTP or
HTTPS.

## BattleMetrics resolution

`npm run resolve:servers` searches BattleMetrics using each configured address,
verifies the host and port, and updates the generated metadata cache. Existing
cache entries are reused so routine builds do not repeatedly query the API.

To refresh every cached entry:

```sh
npm run resolve:servers -- --refresh
```

If a new server cannot be resolved, confirm that its address is correct and
that the server appears on BattleMetrics. The resolver will fail rather than
silently adding an incorrect ID.
