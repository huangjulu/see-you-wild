"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";

import Button from "@/components/ui/atoms/Button";
import Input from "@/components/ui/atoms/Input";
import Overlay from "@/components/ui/atoms/Overlay";
import RadioOption from "@/components/ui/atoms/RadioOption";
import Switch from "@/components/ui/atoms/Switch";
import CountrySelector from "@/components/ui/molecules/CountrySelector";
import DrawerCalendar from "@/components/ui/molecules/DrawerCalendar";
import IdNumberInput from "@/components/ui/molecules/IdNumberInput";
import ModalCard from "@/components/ui/molecules/ModalCard";
import PhoneInput from "@/components/ui/molecules/PhoneInput";
import Selector from "@/components/ui/molecules/Selector";
import { adminApi } from "@/lib/api/admin.api";
import {
  calculateAge,
  type CountryRule,
  getCountryByIso,
  normalizePhone,
  toLocalPhone,
} from "@/lib/form-rules";
import { useToast } from "@/lib/hooks/useToast";
import { useTranslations } from "@/lib/i18n/client";
import type { EventListDto, RegistrationAdminDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import {
  createRegistrationErrorMap,
  type RegistrationFormInput,
  registrationFormSchema,
} from "@/lib/validations/registrations";

interface RegistrationFormModalProps {
  open: boolean;
  onClose: () => void;
  registration: RegistrationAdminDto | null;
  events: EventListDto[];
  preselectedEventId: string | null;
}

const RegistrationFormModal = (props: RegistrationFormModalProps) => {
  const t = useTranslations("registration");
  const tValidation = useTranslations("validation");
  const { toast } = useToast();
  const isEditMode = props.registration != null;
  const createMutation = adminApi.registrations.useCreate();
  const updateMutation = adminApi.registrations.useUpdate();
  const confirmPaymentMutation = adminApi.registrations.useConfirmPayment();

  const [selectedEventId, setSelectedEventId] = useState(
    props.preselectedEventId ?? ""
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eventError, setEventError] = useState<string | null>(null);
  const detailQuery = adminApi.registrations.useDetail(
    props.registration?.id ?? null
  );

  useEffect(
    function syncSelectedDate() {
      if (!isEditMode || !detailQuery.data) return;
      setSelectedEventId(detailQuery.data.event_id);
      setSelectedDate(detailQuery.data.selected_date ?? "");
    },
    [isEditMode, detailQuery.data]
  );

  const formValues = useMemo(() => {
    if (!detailQuery.data) {
      return DEFUALT_VALUE;
    }

    const pickupLocation = isValidPickupSlug(detailQuery.data.pickup_location)
      ? detailQuery.data.pickup_location
      : null;

    const editCountry =
      getCountryByIso(detailQuery.data.country) ?? FALLBACK_COUNTRY;

    return {
      name: detailQuery.data.name,
      email: detailQuery.data.email,
      phone: toLocalPhone(detailQuery.data.phone, editCountry),
      line_id: detailQuery.data.line_id,
      country: detailQuery.data.country,
      gender: detailQuery.data.gender,
      id_number: detailQuery.data.id_number,
      birthday: detailQuery.data.birthday,
      guardian_consent: detailQuery.data.guardian_consent,
      emergency_contact_name: detailQuery.data.emergency_contact_name,
      emergency_contact_phone: toLocalPhone(
        detailQuery.data.emergency_contact_phone,
        FALLBACK_COUNTRY
      ),
      dietary: detailQuery.data.dietary,
      wants_rental: detailQuery.data.wants_rental,
      notes: detailQuery.data.notes,
      transport: detailQuery.data.transport,
      pickup_location: pickupLocation,
      carpool_role: detailQuery.data.carpool_role,
      seat_count: detailQuery.data.seat_count,
    };
  }, [detailQuery.data]);

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(registrationFormSchema, {
      error: createRegistrationErrorMap(tValidation),
    }),
    values: formValues,
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleRegistrationSubmit(data: RegistrationFormInput) {
    if (methods.formState.isSubmitting) return;

    if (selectedEventId === "") {
      setEventError("請選擇活動");
      return;
    }
    setEventError(null);

    const country = getCountryByIso(data.country) ?? FALLBACK_COUNTRY;
    const normalizedPhone = normalizePhone(data.phone, country);
    const normalizedEmergencyPhone = normalizePhone(
      data.emergency_contact_phone,
      FALLBACK_COUNTRY
    );

    const payload = {
      ...data,
      phone: normalizedPhone ?? data.phone,
      emergency_contact_phone:
        normalizedEmergencyPhone ?? data.emergency_contact_phone,
      selected_date: selectedDate || null,
    };

    if (isEditMode && props.registration) {
      updateMutation.mutate(
        { id: props.registration.id, data: payload },
        {
          onSuccess: () => {
            toast.success("報名編輯成功");
            props.onClose();
          },
          onError: (err) => {
            toast.error("操作失敗", { description: err.message });
          },
        }
      );
    } else {
      createMutation.mutate(
        { ...payload, event_id: selectedEventId },
        {
          onSuccess: () => {
            toast.success("報名建立成功");
            props.onClose();
          },
          onError: (err) => {
            toast.error("操作失敗", { description: err.message });
          },
        }
      );
    }
  }

  function onEventChange(value: string) {
    setSelectedEventId(value);
    if (value !== "") setEventError(null);
  }

  const eventOptions = props.events.map((event) => ({
    value: event.id,
    label: event.title,
  }));

  const selectedEvent = props.events.find((e) => e.id === selectedEventId);
  const dateOptions = (selectedEvent?.available_dates ?? []).map((d) => ({
    value: d,
    label: d,
  }));

  return (
    <Overlay open={props.open} onBackdropClick={props.onClose}>
      <FormProvider {...methods}>
        <ModalCard className="w-full max-w-lg max-h-[90vh]">
          <ModalCard.Header title={isEditMode ? "編輯報名" : "新增報名"}>
            <ModalCard.Header.CloseButton onClick={props.onClose} />
          </ModalCard.Header>
          <ModalCard.Main>
            {detailQuery.error && (
              <p className="typo-ui text-sm text-critical mb-4">
                {detailQuery.error.message}
              </p>
            )}
            <form
              id={FORM_ID}
              onSubmit={methods.handleSubmit(handleRegistrationSubmit)}
              className="space-y-6"
            >
              <FieldsetEvent
                events={eventOptions}
                isEditMode={isEditMode}
                value={selectedEventId}
                onChange={onEventChange}
                error={eventError}
              />
              {dateOptions.length > 0 && (
                <Selector
                  label="活動日期"
                  placeholder="請選擇活動日期"
                  options={dateOptions}
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              )}
              <FieldsetBasic />
              <FieldsetIdentity />
              <FieldsetEmergency />
              <FieldsetActivity />
              <FieldsetTransport />
            </form>
            {methods.formState.errors.root && (
              <p className="typo-ui text-sm text-critical mt-2">
                {methods.formState.errors.root.message}
              </p>
            )}
          </ModalCard.Main>
          <ModalCard.Footer className="justify-between">
            <div>
              {isEditMode && props.registration?.status !== "paid" && (
                <Button
                  theme="outline"
                  className="border-green-300 text-success hover:bg-green-50"
                  disabled={confirmPaymentMutation.isPending}
                  onClick={() => {
                    if (!props.registration) return;
                    confirmPaymentMutation.mutate(props.registration.id, {
                      onSuccess: () => {
                        toast.success("已確認收款");
                        props.onClose();
                      },
                      onError: (err) => {
                        toast.error("操作失敗", { description: err.message });
                      },
                    });
                  }}
                >
                  {confirmPaymentMutation.isPending
                    ? "處理中..."
                    : "已收到匯款"}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <ModalCard.Footer.CancelButton onClick={props.onClose}>
                取消
              </ModalCard.Footer.CancelButton>
              <ModalCard.Footer.ConfirmButton
                onClick={methods.handleSubmit(handleRegistrationSubmit)}
                disabled={isPending}
              >
                {isPending ? "處理中..." : isEditMode ? "儲存" : "建立"}
              </ModalCard.Footer.ConfirmButton>
            </div>
          </ModalCard.Footer>
        </ModalCard>
      </FormProvider>
    </Overlay>
  );
};

RegistrationFormModal.displayName = "RegistrationFormModal";
export default RegistrationFormModal;

// ---------------------------------------------------------------------------
// Fieldset: Event
// ---------------------------------------------------------------------------

interface FieldsetEventProps {
  events: { value: string; label: string }[];
  isEditMode: boolean;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

const FieldsetEvent = (props: FieldsetEventProps) => {
  return (
    <fieldset className="space-y-3">
      <Selector
        label="活動"
        placeholder="請選擇活動"
        options={props.events}
        value={props.value}
        onChange={props.onChange}
        error={props.error ?? undefined}
        disabled={props.isEditMode}
      />
    </fieldset>
  );
};

FieldsetEvent.displayName = "FieldsetEvent";

// ---------------------------------------------------------------------------
// Fieldset: Basic
// ---------------------------------------------------------------------------

const FieldsetBasic = () => {
  const t = useTranslations("registration");
  const { register, control, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
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

      <div className="space-y-1">
        <span className="typo-ui text-sm text-primary">{t("gender")}</span>
        <div className="flex flex-wrap gap-2">
          <RadioOption
            variant="outlined"
            label={t("genderMale")}
            value="male"
            {...register("gender")}
          />
          <RadioOption
            variant="outlined"
            label={t("genderFemale")}
            value="female"
            {...register("gender")}
          />
          <RadioOption
            variant="outlined"
            label={t("genderOther")}
            value="other"
            {...register("gender")}
          />
        </div>
        {errors.gender && (
          <p className="typo-ui text-xs text-critical">
            {errors.gender.message}
          </p>
        )}
      </div>

      <Controller
        name="birthday"
        control={control}
        render={({ field }) => (
          <DrawerCalendar
            label={t("birthday")}
            placeholder={t("birthdayPlaceholder")}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.birthday?.message}
          />
        )}
      />

      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <CountrySelector
            label={t("country")}
            className="w-full"
            placeholder={t("selectCountry")}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.country?.message}
          />
        )}
      />
    </fieldset>
  );
};

FieldsetBasic.displayName = "FieldsetBasic";

// ---------------------------------------------------------------------------
// Fieldset: Identity
// ---------------------------------------------------------------------------

const FieldsetIdentity = () => {
  const t = useTranslations("registration");
  const { control, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const country = useWatch({ control, name: "country" });
  const countryRule = getCountryByIso(country) ?? FALLBACK_COUNTRY;

  return (
    <fieldset className="space-y-3">
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            label={t("phone")}
            hint={t("phoneHint")}
            country={countryRule}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
            ref={field.ref}
          />
        )}
      />

      <Controller
        name="id_number"
        control={control}
        render={({ field }) => (
          <IdNumberInput
            country={country}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.id_number?.message}
            ref={field.ref}
          />
        )}
      />

      <Controller
        name="line_id"
        control={control}
        render={({ field }) => (
          <Input
            label={t("lineId")}
            placeholder={t("lineIdPlaceholder")}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.line_id?.message}
            ref={field.ref}
          />
        )}
      />
    </fieldset>
  );
};

FieldsetIdentity.displayName = "FieldsetIdentity";

// ---------------------------------------------------------------------------
// Fieldset: Emergency
// ---------------------------------------------------------------------------

const FieldsetEmergency = () => {
  const t = useTranslations("registration");
  const { register, control, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const birthday = useWatch({ control, name: "birthday" });
  const showGuardianConsent =
    birthday !== "" && birthday != null && calculateAge(birthday) < 18;

  return (
    <fieldset className="space-y-4">
      {showGuardianConsent && (
        <div className="space-y-2 rounded-md border border-stroke-default bg-brand-50 p-3">
          <p className="typo-ui text-sm text-secondary">{t("guardianHint")}</p>
          <Controller
            name="guardian_consent"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 accent-brand-500"
                  checked={field.value === true}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                <span className="typo-ui text-sm text-primary">
                  {t("guardianConsentLabel")}
                </span>
              </label>
            )}
          />
          {errors.guardian_consent && (
            <p className="typo-ui text-xs text-critical">
              {errors.guardian_consent.message}
            </p>
          )}
        </div>
      )}

      <Input
        label={t("emergencyName")}
        placeholder={t("emergencyNamePlaceholder")}
        {...register("emergency_contact_name")}
        error={errors.emergency_contact_name?.message}
      />

      <Controller
        name="emergency_contact_phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            label={t("emergencyPhone")}
            country={EMERGENCY_DEFAULT_COUNTRY}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.emergency_contact_phone?.message}
            ref={field.ref}
          />
        )}
      />
    </fieldset>
  );
};

FieldsetEmergency.displayName = "FieldsetEmergency";

// ---------------------------------------------------------------------------
// Fieldset: Activity
// ---------------------------------------------------------------------------

const FieldsetActivity = () => {
  const t = useTranslations("registration");
  const { register, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
      <div className="space-y-1">
        <span className="typo-ui text-sm text-primary">{t("dietary")}</span>
        <div className="flex flex-wrap gap-2">
          <RadioOption
            variant="outlined"
            label={t("dietaryOmnivore")}
            value="omnivore"
            {...register("dietary")}
          />
          <RadioOption
            variant="outlined"
            label={t("dietaryNoBeef")}
            value="no_beef"
            {...register("dietary")}
          />
          <RadioOption
            variant="outlined"
            label={t("dietaryVegetarian")}
            value="vegetarian"
            {...register("dietary")}
          />
          <RadioOption
            variant="outlined"
            label={t("dietaryVegan")}
            value="vegan"
            {...register("dietary")}
          />
        </div>
        {errors.dietary && (
          <p className="typo-ui text-xs text-critical">
            {errors.dietary.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="typo-ui text-sm text-primary">{t("wantsRental")}</span>
        <Switch {...register("wants_rental")} />
      </div>

      <Input
        label={t("notes")}
        placeholder={t("notesPlaceholder")}
        {...register("notes")}
        error={errors.notes?.message}
      />
    </fieldset>
  );
};

FieldsetActivity.displayName = "FieldsetActivity";

// ---------------------------------------------------------------------------
// Fieldset: Transport
// ---------------------------------------------------------------------------

const FieldsetTransport = () => {
  const t = useTranslations("registration");
  const { register, watch, control, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const transport = watch("transport");
  const carpoolRole = watch("carpool_role");

  const seatCountOptions = SEAT_COUNT_VALUES.map((value) => ({
    value: String(value),
    label: t("seatCountOption", { count: value }),
  }));

  return (
    <fieldset className="space-y-3">
      <div className="space-y-1">
        <span className="typo-ui text-sm text-primary">{t("transport")}</span>
        <div className="flex flex-wrap gap-2">
          <RadioOption
            variant="outlined"
            label={t("transportSelf")}
            value="self"
            {...register("transport")}
          />
          <RadioOption
            variant="outlined"
            label={t("transportCarpool")}
            value="carpool"
            {...register("transport")}
          />
        </div>
        {errors.transport && (
          <p className="typo-ui text-xs text-critical">
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
            <span className="typo-ui text-sm text-primary">
              {t("pickupLocation")}
            </span>
            <div className="flex flex-wrap gap-2">
              {PICKUP_SLUGS.map((slug) => (
                <RadioOption
                  variant="outlined"
                  key={slug}
                  label={t(`pickupSlug.${slug}`)}
                  value={slug}
                  {...register("pickup_location")}
                />
              ))}
            </div>
            {errors.pickup_location && (
              <p className="typo-ui text-xs text-critical">
                {errors.pickup_location.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="typo-ui text-sm text-primary">
              {t("carpoolRole")}
            </span>
            <div className="flex flex-wrap gap-2">
              <RadioOption
                variant="outlined"
                label={t("carpoolPassenger")}
                value="passenger"
                {...register("carpool_role")}
              />
              <RadioOption
                variant="outlined"
                label={t("carpoolDriver")}
                value="driver"
                {...register("carpool_role")}
              />
            </div>
            {errors.carpool_role && (
              <p className="typo-ui text-xs text-critical">
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
              <Controller
                name="seat_count"
                control={control}
                render={({ field }) => (
                  <Selector
                    label={t("seatCount")}
                    placeholder={t("selectSeatCount")}
                    options={seatCountOptions}
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(v) => field.onChange(parseInt(v, 10))}
                    onBlur={field.onBlur}
                    error={errors.seat_count?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
};

FieldsetTransport.displayName = "FieldsetTransport";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const FORM_ID = "admin-registration-form";

const PICKUP_SLUGS = [
  "taipei",
  "nangang",
  "dapinglin",
  "sanchong",
  "banqiao",
] as const;

const SEAT_COUNT_VALUES = [3, 4, 5] as const;

const FALLBACK_COUNTRY: CountryRule = {
  iso: "TW",
  nameZh: "台灣",
  nameEn: "Taiwan",
  dialCode: "+886",
  phoneExample: "+886 912 345 678",
  trunkPrefix: "0",
};

const EMERGENCY_DEFAULT_COUNTRY: CountryRule = FALLBACK_COUNTRY;

type PickupSlug = (typeof PICKUP_SLUGS)[number];

function isValidPickupSlug(value: string | null): value is PickupSlug {
  if (value == null) return false;
  return PICKUP_SLUGS.some((slug) => slug === value);
}

const DEFUALT_VALUE = {
  name: "",
  email: "",
  phone: "",
  line_id: null,
  country: "TW" as const,
  gender: "male" as const,
  id_number: "",
  birthday: "",
  guardian_consent: null,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  dietary: "omnivore" as const,
  wants_rental: false,
  notes: null,
  transport: "self" as const,
  pickup_location: null,
  carpool_role: null,
  seat_count: null,
} as const;
