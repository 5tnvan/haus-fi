"use server";

import { createClient } from "../supabase/server";

/**
 * CREATE: createHausSwipe()
 * TABLE: "haus_swipes"
 **/

export const createHausSwipe = async (haus_id: string, swiped_by: string) => {
  const supabase = await createClient();

  console.log("haus_id, swiped_by", haus_id, swiped_by);

  const { error } = await supabase
    .from("haus_swipes")
    .insert({ haus_id, swiped_by, swiped_right: true })
    .select()
    .single();

  return error;
};

/**
 * CREATE: readAllSwipedBy()
 * TABLE: "haus_swipes"
 **/

export const readAllSwipedBy = async (current_haus_id: string) => {
  console.log("current_haus_id", current_haus_id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("haus_swipes")
    .select("*, haus:haus!haus_swipes_haus_id_fkey(*)")
    .eq("swiped_by", current_haus_id);

  if (error) {
    console.error("Error fetching swipes:", error);
  }

  return { data, error };
};

/**
 * CREATE: readAllHausId()
 * TABLE: "haus_swipes"
 **/

export const readAllHausId = async (current_haus_id: string) => {
  console.log("current_haus_id", current_haus_id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("haus_swipes")
    .select("*, haus:haus!haus_swipes_swiped_by_fkey(*)")
    .eq("haus_id", current_haus_id); //

  if (error) {
    console.error("Error fetching swipes:", error);
  }

  return { data, error };
};

/**
 * CREATE: readAllMatches()
 * TABLE: "haus_swipes"
 **/

export const readAllMatches = async (current_haus_id: string) => {
  console.log("current_haus_id", current_haus_id);
  const supabase = await createClient();

  // Step 1: Get all swipes made by the current haus (users who swiped right on others)
  const { data: swipesMade, error: madeError } = await supabase
    .from("haus_swipes")
    .select("*, haus:haus!haus_swipes_haus_id_fkey(*, haus_signers(*))")
    .eq("swiped_by", current_haus_id);

  if (madeError) {
    console.error("Error fetching swipes made:", madeError);
  }

  // Step 2: Get all swipes received by the current haus (users who swiped right on the current haus)
  const { data: swipesReceived, error: receivedError } = await supabase
    .from("haus_swipes")
    .select("*, haus:haus!haus_swipes_swiped_by_fkey(*, haus_signers(*))")
    .eq("haus_id", current_haus_id);

  if (receivedError) {
    console.error("Error fetching swipes received:", receivedError);
  }

  console.log("swipesMade", swipesMade);
  console.log("swipesReceived", swipesReceived);

  // Step 3: Find matching swipes (where the user has swiped right on each other)
  const matches = swipesMade
    ?.map(swipeMade => {
      // Find the corresponding swipe that matches (i.e., the other person swiped right on current haus)
      const match = swipesReceived?.find(swipeReceived => swipeReceived.swiped_by === swipeMade.haus_id);
      if (match) {
        return {
          matchHaus: swipeMade.haus,
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null values from the final result

  return { matches };
};
