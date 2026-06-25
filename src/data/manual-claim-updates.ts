import type { HomeBlogUpdate } from "./blog-updates";
import rawManualClaimUpdates from "./manual-claim-updates.json";

export const manualClaimUpdates = rawManualClaimUpdates as readonly HomeBlogUpdate[];
