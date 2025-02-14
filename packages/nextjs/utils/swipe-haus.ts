"use server";
import { createHausSwipe } from "~~/utils/crud/crud-haus-swipes";

export async function swipeHausAction(hausId: string, userHausId: string) {
  return await createHausSwipe(hausId, userHausId);
}
