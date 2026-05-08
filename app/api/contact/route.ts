import { NextRequest } from "next/server";

import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import { sendContactProposal } from "@/lib/email/send-contact-proposal";
import { contactFormSchema } from "@/lib/validations/contact";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactFormSchema.parse(body);
    await sendContactProposal(data);
    return apiOk({ success: true }, 200);
  } catch (err) {
    return handleError(err);
  }
}
