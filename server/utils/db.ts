import { db } from "@nuxthub/db";

export type Database = typeof db;

export function useDB(): Database {
  return db;
}
