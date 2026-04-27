import { getSupabase } from "@/lib/supabase/client";
import { updateRegistrationSchema } from "@/lib/validations/registrations";
import { apiOk } from "@/lib/api-response";
import { handleError } from "@/lib/api/handle-error";
import {
  AlreadyRegisteredError,
  InternalError,
  RegistrationNotFoundError,
} from "@/lib/errors/domain";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await getSupabase()
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new RegistrationNotFoundError();
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateRegistrationSchema.parse(body);

    const updateData: Record<string, unknown> = { ...parsed };

    if (parsed.status === "paid") {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await getSupabase()
      .from("registrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // PATCH may update email and collide with the (event_id, lower(email)) unique index.
      if (
        error.code === "23505" &&
        error.message?.includes("registrations_event_email")
      ) {
        throw new AlreadyRegisteredError();
      }
      throw new InternalError(error.message, error);
    }

    return apiOk(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await getSupabase()
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) {
      throw new InternalError(error.message, error);
    }

    return apiOk({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
