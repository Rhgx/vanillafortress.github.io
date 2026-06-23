import type { CommunityDefinition } from "../core/types";

const modules = import.meta.glob<{ default: CommunityDefinition }>("./*.ts", {
  eager: true,
});

export const communities = Object.entries(modules)
  .filter(([path]) => !path.endsWith("/index.ts"))
  .map(([, module]) => module.default)
  .sort((a, b) => a.name.localeCompare(b.name)) satisfies CommunityDefinition[];
