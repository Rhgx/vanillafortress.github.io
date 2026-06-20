import { communities } from "./communities";
import { validateServerDirectory } from "./core/validate";
import { regions } from "./regions";

export const serverDefinitions = validateServerDirectory(communities, regions);
