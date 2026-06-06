import { addYear, diffDays, diffYears, isBefore } from "@formkit/tempo";

export type GiftIdea = {
  id: string;
  title: string;
  description: string;
  estimatedPrice: string;
  vibe:
    | "Practical"
    | "Sentimental"
    | "Experience"
    | "Creative"
    | "Humorous"
    | "Premium";
  whereToBuy: string;
};

export type BirthdayRow = {
  id: string;
  orgId: string;
  createdBy: string;
  name: string;
  relation: string;
  birthDate: string;
  includeYear: boolean;
  interests: string;
  notes: string | null;
  savedGifts: string;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
};

export type BirthdayDto = Omit<
  BirthdayRow,
  "interests" | "savedGifts" | "createdAt" | "updatedAt"
> & {
  interests: string[];
  savedGifts: GiftIdea[];
  createdAt: string;
  updatedAt: string;
  nextBirthday: string;
  daysUntil: number;
  age: number | null;
};

export type BirthdayInput = {
  name: string;
  relation: string;
  birthDate: string;
  includeYear: boolean;
  interests: string[];
  notes: string | null;
  savedGifts: GiftIdea[];
};

// ---------- date helpers ----------

// Birthdays are date-only values, so we anchor everything at UTC midnight to
// avoid timezone drift between server (Workers = UTC) and client.

function parseBirthDateUTC(birthDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) {
    throw new Error("invalid birthDate");
  }
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function todayUTC(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function nextBirthdayDate(birthDate: string, now = new Date()): Date {
  const birth = parseBirthDateUTC(birthDate);
  const today = todayUTC(now);
  let next = new Date(
    Date.UTC(today.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate()),
  );
  if (isBefore(next, today)) {
    next = addYear(next, 1);
  }
  return next;
}

export function daysUntilBirthday(birthDate: string, now = new Date()): number {
  return diffDays(nextBirthdayDate(birthDate, now), todayUTC(now));
}

export function calculateAge(birthDate: string, now = new Date()): number {
  return diffYears(todayUTC(now), parseBirthDateUTC(birthDate));
}

// ---------- serialize / sort ----------

export function serializeBirthday(row: BirthdayRow): BirthdayDto {
  let interests: string[] = [];
  let savedGifts: GiftIdea[] = [];
  try {
    const parsed = JSON.parse(row.interests || "[]");
    if (Array.isArray(parsed))
      interests = parsed.filter((s) => typeof s === "string");
  } catch {}
  try {
    const parsed = JSON.parse(row.savedGifts || "[]");
    if (Array.isArray(parsed)) savedGifts = parsed;
  } catch {}

  const next = nextBirthdayDate(row.birthDate);
  return {
    ...row,
    interests,
    savedGifts,
    createdAt: serializeTimestamp(row.createdAt),
    updatedAt: serializeTimestamp(row.updatedAt),
    nextBirthday: next.toISOString().slice(0, 10),
    daysUntil: daysUntilBirthday(row.birthDate),
    age: row.includeYear ? calculateAge(row.birthDate) : null,
  };
}

function serializeTimestamp(value: Date | string | number): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function sortByUpcoming(rows: BirthdayRow[]): BirthdayDto[] {
  return rows.map(serializeBirthday).sort((a, b) => a.daysUntil - b.daysUntil);
}

// ---------- input validation ----------
function isValidYMD(s: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return false;
  const [year, month, day] = match;
  if (
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > 31
  )
    return false;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

export function validateBirthdayInput(body: any): BirthdayInput {
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Body required" });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name)
    throw createError({ statusCode: 400, statusMessage: "name is required" });
  if (name.length > 100)
    throw createError({ statusCode: 400, statusMessage: "name too long" });

  const relation =
    typeof body.relation === "string" ? body.relation.trim() : "";

  if (!relation)
    throw createError({
      statusCode: 400,
      statusMessage: "relation is required",
    });
  if (relation.length > 50)
    throw createError({ statusCode: 400, statusMessage: "relation too long" });

  const birthDate =
    typeof body.birthDate === "string" ? body.birthDate.trim() : "";
  if (!isValidYMD(birthDate)) {
    throw createError({
      statusCode: 400,
      statusMessage: "birthDate must be a valid YYYY-MM-DD",
    });
  }

  const includeYear =
    body.includeYear === undefined ? true : Boolean(body.includeYear);

  let interests: string[] = [];
  if (Array.isArray(body.interests)) {
    interests = body.interests
      .filter((i: unknown): i is string => typeof i === "string")
      .map((i: string) => i.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  const notes =
    typeof body.notes === "string" && body.notes.trim()
      ? body.notes.trim().slice(0, 1000)
      : null;

  let savedGifts: GiftIdea[] = [];
  if (Array.isArray(body.savedGifts)) {
    savedGifts = body.savedGifts.filter(
      (g: any) =>
        g &&
        typeof g === "object" &&
        typeof g.id === "string" &&
        typeof g.title === "string",
    );
  }

  return {
    name,
    relation,
    birthDate,
    includeYear,
    interests,
    notes,
    savedGifts,
  };
}
