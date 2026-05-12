import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { uploadEventImage } from "@/lib/supabase/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadEventImage(buffer, file.name, file.type);

    return apiOk({ url: publicUrl });
  } catch (err) {
    return handleError(err);
  }
}
