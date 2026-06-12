import { sendStorageAlertEmail } from "@/lib/email/send-storage-alert-email";
import { uploadEventImage as r2Upload } from "@/lib/r2/storage";
import { uploadEventImage as supabaseUpload } from "@/lib/supabase/storage";

export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    return await r2Upload(file, filename, contentType);
  } catch (r2Error) {
    console.error(
      "[storage] R2 upload failed, falling back to Supabase:",
      r2Error
    );

    try {
      const url = await supabaseUpload(file, filename, contentType);

      sendStorageAlertEmail({
        level: "warning",
        filename,
        r2Error: r2Error instanceof Error ? r2Error.message : String(r2Error),
      }).catch((emailErr) =>
        console.error("[storage] Failed to send warning email:", emailErr)
      );

      return url;
    } catch (supabaseError) {
      sendStorageAlertEmail({
        level: "critical",
        filename,
        r2Error: r2Error instanceof Error ? r2Error.message : String(r2Error),
        supabaseError:
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError),
      }).catch((emailErr) =>
        console.error("[storage] Failed to send critical email:", emailErr)
      );

      throw new Error("All storage backends failed");
    }
  }
}
