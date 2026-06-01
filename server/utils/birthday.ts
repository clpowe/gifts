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
  createdAt: Date;
  updatedAt: Date;
};

export type BirthdayDto = Omit<BirthdayRow, "interests" | "savedGifts"> & {
  interests: string[];
  savedGifts: GiftIdea[];
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
