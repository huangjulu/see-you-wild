import { fileTypeFromBuffer } from "file-type";

import { handleError } from "@/lib/api/handle-error";
import { apiOk } from "@/lib/api-response";
import { uploadEventImage } from "@/lib/r2/storage";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiOk({ error: "No file provided" }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiOk({ error: "檔案大小不可超過 4MB" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const detected = await fileTypeFromBuffer(buffer);
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
      return apiOk({ error: "僅支援 JPG、PNG、WebP 格式" }, 400);
    }

    const publicUrl = await uploadEventImage(buffer, file.name, detected.mime);

    return apiOk({ url: publicUrl });
  } catch (err) {
    return handleError(err);
  }
}
