"use server";

import { createClient } from "../supabase/server";

/**
 * READ: readAllHaus()
 * TABLE: "haus"
 **/

export const readAllHaus = async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("haus").select("*");
  console.log("data", data);
  return data;
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

  console.log("data", data);
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
