"use server";

import { createClient } from "../supabase/server";

/* GET PUBLIC URL */
export async function getPublicURL(filePath: any) {
  const supabase = await createClient();
  const { data } = supabase.storage.from("pic").getPublicUrl(`${filePath}`);
  return data;
}

/* UPLOAD PROFILE PIC */
export async function uploadProfileAvatar(file: any, multisig_id: any) {
  const supabase = await createClient();
  const { data: paths, error } = await supabase.storage.from("pic").upload(`${multisig_id}/${Date.now()}`, file);
  if (error) {
    throw new Error(error.message);
  }
  return paths;
}
