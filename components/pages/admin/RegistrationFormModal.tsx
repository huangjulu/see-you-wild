"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import Input from "@/components/ui/atoms/Input";
import Overlay from "@/components/ui/atoms/Overlay";
import ModalCard from "@/components/ui/molecules/ModalCard";
import { adminApi } from "@/lib/api/admin.api";
import type { EventListDto, RegistrationAdminDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const adminRegistrationSchema = z.object({
  event_id: z.string().min(1, "必填"),
  name: z.string().trim().min(1, "必填"),
  email: z.string().trim().toLowerCase().email("無效的 Email"),
  phone: z.string().trim().min(1, "必填"),
  transport: z.enum(["self", "carpool"]),
});

type AdminRegistrationFormValues = z.infer<typeof adminRegistrationSchema>;

interface RegistrationFormModalProps {
  open: boolean;
  onClose: () => void;
  registration: RegistrationAdminDto | null;
  events: EventListDto[];
  preselectedEventId: string | null;
}

const RegistrationFormModal: React.FC<RegistrationFormModalProps> = (props) => {
  const isEditMode = props.registration != null;
  const createMutation = adminApi.registrations.useCreate();
  const updateMutation = adminApi.registrations.useUpdate();

  const defaultValues: AdminRegistrationFormValues = {
    event_id: props.preselectedEventId ?? "",
    name: "",
    email: "",
    phone: "",
    transport: "self",
  };

  function buildValues(reg: RegistrationAdminDto): AdminRegistrationFormValues {
    return {
      event_id: reg.event_id,
      name: reg.name,
      email: reg.email,
      phone: reg.phone,
      transport: reg.transport,
    };
  }

  const methods = useForm<AdminRegistrationFormValues>({
    resolver: zodResolver(adminRegistrationSchema),
    values:
      props.registration != null
        ? buildValues(props.registration)
        : defaultValues,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleFormSubmit(values: AdminRegistrationFormValues) {
    if (props.registration != null) {
      const { event_id: _eventId, ...data } = values;
      updateMutation.mutate(
        { id: props.registration.id, data },
        { onSuccess: props.onClose }
      );
    } else {
      createMutation.mutate(
        {
          ...values,
          country: "TW",
          gender: "male",
          id_number: "ADMIN-CREATED",
          birthday: "2000-01-01",
          emergency_contact_name: "N/A",
          emergency_contact_phone: "+886900000000",
          dietary: "omnivore",
          wants_rental: false,
          notes: null,
          line_id: null,
          pickup_location: null,
          carpool_role: null,
          seat_count: null,
          guardian_consent: null,
        },
        { onSuccess: props.onClose }
      );
    }
  }

  return (
    <Overlay open={props.open} onBackdropClick={props.onClose}>
      <ModalCard className="w-full max-w-lg max-h-[90vh]">
        <ModalCard.Header title={isEditMode ? "編輯報名" : "新增報名"}>
          <ModalCard.Header.CloseButton onClick={props.onClose} />
        </ModalCard.Header>
        <ModalCard.Main>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <RegistrationFormFields
                isEditMode={isEditMode}
                events={props.events}
              />
            </form>
          </FormProvider>
        </ModalCard.Main>
        <ModalCard.Footer>
          <ModalCard.Footer.CancelButton onClick={props.onClose}>
            取消
          </ModalCard.Footer.CancelButton>
          <ModalCard.Footer.ConfirmButton
            onClick={methods.handleSubmit(handleFormSubmit)}
            disabled={isPending}
          >
            {isPending ? "處理中..." : isEditMode ? "儲存" : "建立"}
          </ModalCard.Footer.ConfirmButton>
        </ModalCard.Footer>
      </ModalCard>
    </Overlay>
  );
};

RegistrationFormModal.displayName = "RegistrationFormModal";
export default RegistrationFormModal;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface RegistrationFormFieldsProps {
  isEditMode: boolean;
  events: EventListDto[];
}

const RegistrationFormFields: React.FC<RegistrationFormFieldsProps> = (
  props
) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AdminRegistrationFormValues>();

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="typo-ui text-sm text-primary">活動</label>
        <select
          {...register("event_id")}
          disabled={props.isEditMode}
          className={cn(
            "h-10 w-full rounded-md border px-4 typo-body transition-colors",
            "border-stroke-default bg-white text-primary",
            "hover:border-brand-400",
            "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none",
            "disabled:bg-neutral-100 disabled:text-secondary disabled:cursor-not-allowed",
            errors.event_id != null && "border-critical ring-critical/20"
          )}
        >
          <option value="">請選擇活動</option>
          {props.events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
        {errors.event_id != null && (
          <p className="typo-ui text-xs text-critical">
            {errors.event_id.message}
          </p>
        )}
      </div>
      <Input label="姓名" {...register("name")} error={errors.name?.message} />
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="電話"
        placeholder="+886912345678"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <div className="flex flex-col gap-1">
        <label className="typo-ui text-sm text-primary">交通方式</label>
        <select
          {...register("transport")}
          className={cn(
            "h-10 w-full rounded-md border px-4 typo-body transition-colors",
            "border-stroke-default bg-white text-primary",
            "hover:border-brand-400",
            "focus:border-accent focus:ring-2 focus:ring-brand-200/70 focus-visible:outline-none"
          )}
        >
          <option value="self">自行前往</option>
          <option value="carpool">共乘</option>
        </select>
      </div>
    </>
  );
};

RegistrationFormFields.displayName = "RegistrationFormFields";
