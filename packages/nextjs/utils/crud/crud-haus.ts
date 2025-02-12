"use server";

import { createClient } from "../supabase/server";

/**
 * READ: readAllHaus()
 * TABLE: "haus"
 **/

export const readHausRandomView = async (limit: number, current_haus_id: string) => {
  console.log("current_haus_id", current_haus_id);

  const supabase = await createClient();

  // Specify the relationship explicitly for embedding haus_swipes
  const { data, error } = await supabase
    .from("haus_random_view")
    .select("*, haus_signers(signer_wallet_id), haus_swipes!haus_swipes_haus_id_fkey(swiped_by, swiped_right)")
    .limit(limit);

  if (error) {
    console.error("Error fetching haus data:", error);
    return [];
  }

  // Filter in-memory to mark swipes
  const enhancedData = data.map(haus => ({
    ...haus,
    hasSwipedRight: haus.haus_swipes.some(
      (swipe: { swiped_by: string; swiped_right: boolean }) =>
        swipe.swiped_by === current_haus_id && swipe.swiped_right === true,
    ),
  }));
  return enhancedData;
};

/**
 * READ: readHausFromSigner()
 * TABLE: "haus_signers"
 **/

export const readHausFromSigner = async (signer_wallet_id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("haus_signers")
    .select("*, haus(*)")
    .eq("signer_wallet_id", signer_wallet_id); // Correct syntax

  if (error) {
    console.error("Error fetching haus_signers:", error);
    return null;
  }
  return data;
};

/**
 * READ: readHausFromSigner()
 * TABLE: "haus_signers"
 **/

export const readHausFromId = async (haus_id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("haus").select("*, haus_signers(*)").eq("id", haus_id); // Correct syntax

  if (error) {
    console.error("Error fetching haus_signers:", error);
    return null;
  }
  return data;
};

/**
 * CREATE: readHausFromSigner()
 * TABLE: "haus"
 **/

export const createHaus = async (
  multisig_id: string,
  title: string,
  description: string,
  profile_pic: string,
  signer_wallet_id: string,
) => {
  const supabase = await createClient();

  const { data: insertedHaus, error: hausError } = await supabase
    .from("haus")
    .insert({ multisig_id, title, description, profile_pic })
    .select()
    .single();

  if (hausError || !insertedHaus) {
    throw new Error("Failed to create Haus.");
  }

  const { data: insertedSigner, error: signerError } = await supabase
    .from("haus_signers")
    .insert({ haus_id: insertedHaus.id, signer_wallet_id })
    .select()
    .single();

  if (signerError || !insertedSigner) {
    throw new Error("Failed to add signer.");
  }

  return insertedSigner;
};
