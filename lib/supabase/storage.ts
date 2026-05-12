import { getSupabase } from "@/lib/supabase/client";

const BUCKET = "event-images";

export async function uploadEventImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const ext = filename.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path);

  return data.publicUrl;
}
