import type { CommunityDefinition } from "../core/types";

export default {
  name: "Pipeline.tf",
  links: {
    steam: "https://steamcommunity.com/groups/plr_pipeline",
    discord: "https://discord.gg/YYU6qhkeV",
  },
  servers: [
    {
      name: "Pipeline.tf (EU)",
      id: 38185353,
      region: "eu",
      ip: "170.23.138.191:22208",
    },
    {
      name: "Pipeline.tf (NA)",
      id: 38102671,
      region: "na",
      ip: "170.23.69.133:22402",
    },
  ],
} satisfies CommunityDefinition;
