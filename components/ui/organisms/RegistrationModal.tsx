"use client";

import { useRef } from "react";
import { z } from "zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "@/lib/i18n/client";
import {
  registrationFormSchema,
  type RegistrationFormInput,
} from "@/lib/validations/registrations";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Input from "@/components/ui/atoms/Input";
import RadioOption from "@/components/ui/atoms/RadioOption";
import Switch from "@/components/ui/atoms/Switch";
import { cn } from "@/lib/utils";

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  basePrice: number;
  carpoolSurcharge: number;
  selectedDate: string | null;
  selectedPickup: string | null;
  isSelfArrival: boolean;
  pickupLocations: string[];
}

const FORM_ID = "registration-form";

const PICKUP_SLUG_TO_DISPLAY: Record<string, string> = {
  taipei: "台北車站",
  nangang: "南港車站",
  dapinglin: "大坪林站",
  sanchong: "三重站",
  banqiao: "板橋車站",
};

const PICKUP_SLUGS = [
  "taipei",
  "nangang",
  "dapinglin",
  "sanchong",
  "banqiao",
] as const;

const RegistrationModal: React.FC<RegistrationModalProps> = (props) => {
  const t = useTranslations("registration");
  const tValidation = useTranslations("validation");
  const formRef = useRef<HTMLFormElement>(null);

  const zodErrorMap: z.ZodErrorMap = (issue) => {
    if (issue.code === "custom") {
      return { message: tValidation(issue.message ?? "required") };
    }
    switch (issue.code) {
      case "too_small":
        return { message: tValidation("required") };
      case "invalid_format":
        if (issue.format === "email")
          return { message: tValidation("invalidEmail") };
        return { message: tValidation("invalidFormat") };
      case "invalid_type":
        if (issue.expected === "string")
          return { message: tValidation("required") };
        return undefined;
      case "invalid_value":
        return { message: tValidation("invalidSelection") };
      default:
        return undefined;
    }
  };

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(registrationFormSchema, { error: zodErrorMap }),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      line_id: null,
      gender: "other",
      id_number: "",
      birthday: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      dietary: "omnivore",
      wants_rental: false,
      notes: null,
      transport: props.isSelfArrival ? "self" : "carpool",
      pickup_location: null,
      carpool_role: null,
      seat_count: null,
    },
  });

  async function onSubmit(data: Record<string, unknown>) {
    if (methods.formState.isSubmitting) return;
    const payload = {
      ...data,
      event_id: props.eventId,
    };

    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      props.onClose();
      return;
    }

    const body = await response.json().catch(() => null);
    const message =
      body != null && typeof body === "object" && "error" in body
        ? String(body.error)
        : t("submitError");
    methods.setError("root", { message });
  }

  function handleConfirmClick() {
    formRef.current?.requestSubmit();
  }

  if (!props.open) {
    return null;
  }

  function handleBackdropClick() {
    if (!methods.formState.isDirty) {
      props.onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-clip"
      onClick={handleBackdropClick}
    >
      <FormProvider {...methods}>
        <ModalCard
          ref={(node) => {
            if (node == null) return;
            node.focus();
          }}
          tabIndex={-1}
          className="w-full max-w-lg max-h-[90vh] outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalCard.Header title={t("title")}>
            <ModalCard.Header.CloseButton onClick={props.onClose} />
          </ModalCard.Header>
          <ModalCard.Main>
            <form
              id={FORM_ID}
              ref={formRef}
              onSubmit={methods.handleSubmit(onSubmit)}
            >
              <FormRegistration
                basePrice={props.basePrice}
                carpoolSurcharge={props.carpoolSurcharge}
                pickupLocations={props.pickupLocations}
              />
            </form>
            {methods.formState.errors.root != null && (
              <p className="typo-ui text-sm text-error mt-2">
                {methods.formState.errors.root.message}
              </p>
            )}
          </ModalCard.Main>
          <ModalCard.Footer>
            <ModalCard.Footer.CancelButton onClick={props.onClose}>
              {t("cancel")}
            </ModalCard.Footer.CancelButton>
            <ModalCard.Footer.ConfirmButton onClick={handleConfirmClick}>
              {t("submit")}
            </ModalCard.Footer.ConfirmButton>
          </ModalCard.Footer>
        </ModalCard>
      </FormProvider>
    </div>
  );
};

RegistrationModal.displayName = "RegistrationModal";
export default RegistrationModal;

/* ─── FormRegistration (same-file sub-component) ─── */

interface FormRegistrationProps {
  basePrice: number;
  carpoolSurcharge: number;
  pickupLocations: string[];
}

const FormRegistration: React.FC<FormRegistrationProps> = (props) => {
  const t = useTranslations("registration");
  const { register, watch, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const transport = watch("transport");
  const carpoolRole = watch("carpool_role");

  const totalPrice =
    transport === "carpool"
      ? props.basePrice + props.carpoolSurcharge
      : props.basePrice;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <fieldset className="space-y-3">
        <legend className="typo-subtitle-2 text-foreground mb-2">
          {t("sectionBasic")}
        </legend>
        <Input
          label={t("name")}
          placeholder={t("namePlaceholder")}
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label={t("email")}
          type="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label={t("phone")}
          type="tel"
          placeholder={t("phonePlaceholder")}
          {...register("phone")}
          error={errors.phone?.message}
        />
        <Input
          label={t("lineId")}
          placeholder={t("lineIdPlaceholder")}
          {...register("line_id")}
          error={errors.line_id?.message}
        />
      </fieldset>

      {/* Identity Info */}
      <fieldset className="space-y-3">
        <legend className="typo-subtitle-2 text-foreground mb-2">
          {t("sectionIdentity")}
        </legend>

        <div className="space-y-1">
          <span className="typo-ui text-sm text-foreground">{t("gender")}</span>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              label={t("genderMale")}
              value="male"
              {...register("gender")}
            />
            <RadioOption
              label={t("genderFemale")}
              value="female"
              {...register("gender")}
            />
            <RadioOption
              label={t("genderOther")}
              value="other"
              {...register("gender")}
            />
          </div>
          {errors.gender != null && (
            <p className="typo-ui text-xs text-error">
              {errors.gender.message}
            </p>
          )}
        </div>

        <Input
          label={t("idNumber")}
          placeholder={t("idNumberPlaceholder")}
          {...register("id_number")}
          error={errors.id_number?.message}
        />
        <Input
          label={t("birthday")}
          type="date"
          {...register("birthday")}
          error={errors.birthday?.message}
        />
      </fieldset>

      {/* Emergency Contact */}
      <fieldset className="space-y-3">
        <legend className="typo-subtitle-2 text-foreground mb-2">
          {t("sectionEmergency")}
        </legend>
        <Input
          label={t("emergencyName")}
          placeholder={t("emergencyNamePlaceholder")}
          {...register("emergency_contact_name")}
          error={errors.emergency_contact_name?.message}
        />
        <Input
          label={t("emergencyPhone")}
          type="tel"
          placeholder={t("emergencyPhonePlaceholder")}
          {...register("emergency_contact_phone")}
          error={errors.emergency_contact_phone?.message}
        />
      </fieldset>

      {/* Activity */}
      <fieldset className="space-y-3">
        <legend className="typo-subtitle-2 text-foreground mb-2">
          {t("sectionActivity")}
        </legend>

        <div className="space-y-1">
          <span className="typo-ui text-sm text-foreground">
            {t("dietary")}
          </span>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              label={t("dietaryOmnivore")}
              value="omnivore"
              {...register("dietary")}
            />
            <RadioOption
              label={t("dietaryNoBeef")}
              value="no_beef"
              {...register("dietary")}
            />
            <RadioOption
              label={t("dietaryVegetarian")}
              value="vegetarian"
              {...register("dietary")}
            />
            <RadioOption
              label={t("dietaryVegan")}
              value="vegan"
              {...register("dietary")}
            />
          </div>
          {errors.dietary != null && (
            <p className="typo-ui text-xs text-error">
              {errors.dietary.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="typo-ui text-sm text-foreground">
            {t("wantsRental")}
          </span>
          <Switch {...register("wants_rental")} />
        </div>

        <Input
          label={t("notes")}
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
          error={errors.notes?.message}
        />
      </fieldset>

      {/* Transport */}
      <fieldset className="space-y-3">
        <legend className="typo-subtitle-2 text-foreground mb-2">
          {t("sectionTransport")}
        </legend>

        <div className="space-y-1">
          <span className="typo-ui text-sm text-foreground">
            {t("transport")}
          </span>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              label={t("transportSelf")}
              value="self"
              {...register("transport")}
            />
            <RadioOption
              label={`${t("transportCarpool")}  +NT$ ${props.carpoolSurcharge.toLocaleString("zh-TW")}`}
              value="carpool"
              {...register("transport")}
            />
          </div>
          {errors.transport != null && (
            <p className="typo-ui text-xs text-error">
              {errors.transport.message}
            </p>
          )}
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300",
            transport === "carpool" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden space-y-3">
            <div className="space-y-1">
              <span className="typo-ui text-sm text-foreground">
                {t("pickupLocation")}
              </span>
              <div className="flex flex-wrap gap-2">
                {PICKUP_SLUGS.map((slug) => (
                  <RadioOption
                    key={slug}
                    label={PICKUP_SLUG_TO_DISPLAY[slug] ?? slug}
                    value={slug}
                    {...register("pickup_location")}
                  />
                ))}
              </div>
              {errors.pickup_location != null && (
                <p className="typo-ui text-xs text-error">
                  {errors.pickup_location.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <span className="typo-ui text-sm text-foreground">
                {t("carpoolRole")}
              </span>
              <div className="flex flex-wrap gap-2">
                <RadioOption
                  label={t("carpoolPassenger")}
                  value="passenger"
                  {...register("carpool_role")}
                />
                <RadioOption
                  label={t("carpoolDriver")}
                  value="driver"
                  {...register("carpool_role")}
                />
              </div>
              {errors.carpool_role != null && (
                <p className="typo-ui text-xs text-error">
                  {errors.carpool_role.message}
                </p>
              )}
            </div>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300",
                carpoolRole === "driver" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <Input
                  label={t("seatCount")}
                  type="number"
                  min={3}
                  max={5}
                  {...register("seat_count", { valueAsNumber: true })}
                  error={errors.seat_count?.message}
                />
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Price Preview */}
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border border-border p-4"
        )}
      >
        <span className="typo-ui text-foreground">{t("totalPrice")}</span>
        <span className="typo-subtitle-1 text-accent-fg">
          NT$ {totalPrice.toLocaleString("zh-TW")}
        </span>
      </div>
    </div>
  );
};

FormRegistration.displayName = "FormRegistration";
