import agartha from "./agartha";
import bbqParty from "./bbq-party";
import fightClubNight from "./fight-club-night";
import pipeline from "./pipeline";
import teepawtz from "./teepawtz";
import tf2Warhouse from "./tf2-warhouse";
import zestys from "./zestys";
import type { CommunityDefinition } from "../core/types";

export const communities = [
  bbqParty,
  pipeline,
  zestys,
  agartha,
  teepawtz,
  fightClubNight,
  tf2Warhouse,
] satisfies CommunityDefinition[];
