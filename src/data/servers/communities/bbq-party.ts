import type { CommunityDefinition } from "../core/types";

export default {
  name: "BBQ Party",
  links: {
    steam: "https://steamcommunity.com/groups/BBQ_Partygoers",
    discord: "https://discord.gg/h3wker9tfF",
  },
  servers: [
    {
      name: "BBQ Party",
      region: "eu",
      ip: "79.76.47.29:27015",
    },
  ],
} satisfies CommunityDefinition;
