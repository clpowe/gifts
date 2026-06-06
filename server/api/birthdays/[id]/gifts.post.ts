import { buildGiftPrompt, type GiftGenerationResult } from "~~/server/utils/gifts";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import { useDB } from "~~/server/utils/db";
import { useAI } from "~~/server/utils/ai";
import { birthdays } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { GIFT_VIBES } from "~~/shared/utils/constants";
import type { GiftVibe } from "~~/shared/utils/constants";
import { calculateAge } from "~~/server/utils/birthday";