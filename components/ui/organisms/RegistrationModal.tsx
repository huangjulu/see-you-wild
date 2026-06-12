"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck as IconCircleCheck, Copy as IconCopy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import ProgressBar from "@/components/ui/atoms/ProgressBar";
import RadioOption from "@/components/ui/atoms/RadioOption";
import Switch from "@/components/ui/atoms/Switch";
import CountrySelector from "@/components/ui/molecules/CountrySelector";
import DrawerCalendar from "@/components/ui/molecules/DrawerCalendar";
import IdNumberInput from "@/components/ui/molecules/IdNumberInput";
import ModalCard from "@/components/ui/molecules/ModalCard";
import PhoneInput from "@/components/ui/molecules/PhoneInput";
import Selector from "@/components/ui/molecules/Selector";
import { ApiError } from "@/lib/api/api-fetch";
import { registrationApi } from "@/lib/api/registration.api";
import { PICKUP_LOCATIONS } from "@/lib/constants";
import {
  calculateAge,
  type CountryRule,
  getCountryByIso,
  normalizePhone,
} from "@/lib/form-rules";
import { useRentalDetailsForm } from "@/lib/hooks/useRentalDetailsForm";
import { useFormatter, useTranslations } from "@/lib/i18n/client";
import { paymentAccount } from "@/lib/payment";
import { cn } from "@/lib/utils";
import {
  createRegistrationErrorMap,
  type RegistrationFormInput,
  registrationFormSchema,
} from "@/lib/validations/registrations";

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  basePrice: number;
  carpoolSurcharge: number;
  selectedDate: string | null;
  selectedPickup: string | null;
  isSelfArrival: boolean;
  carpoolRole: "driver" | "passenger" | null;
  seatCount: number | null;
  paymentDays: number;
  carpoolEnabled: boolean;
  rentalEnabled: boolean;
}

const RegistrationModal = (props: RegistrationModalProps) => {
  const t = useTranslations("registration");
  const tApiError = useTranslations("apiError");
  const tValidation = useTranslations("validation");
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const mutation = registrationApi.useCreate();

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(registrationFormSchema, {
      error: createRegistrationErrorMap(tValidation),
    }),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      line_id: null,
      country: "TW",
      gender: "male",
      id_number: "",
      birthday: "",
      guardian_consent: null,
      emergency_contact_name: "",
      emergency_contact_phone: "",
      dietary: "omnivore",
      rental_details: null,
      notes: null,
      transport: props.isSelfArrival ? "self" : "carpool",
      pickup_location: null,
      carpool_role: null,
      seat_count: null,
    },
  });

  useEffect(
    function syncSelectionOnOpen() {
      if (!props.open) return;
      methods.setValue("transport", props.isSelfArrival ? "self" : "carpool");
      methods.setValue("carpool_role", props.carpoolRole);
      methods.setValue("seat_count", props.seatCount);
      methods.setValue("pickup_location", props.selectedPickup);
    },
    [props.open]
  );

  function handleRegistrationSubmit(data: RegistrationFormInput) {
    const country = getCountryByIso(data.country) ?? FALLBACK_COUNTRY;
    const normalizedPhone = normalizePhone(data.phone, country);
    const normalizedEmergencyPhone = normalizePhone(
      data.emergency_contact_phone,
      FALLBACK_COUNTRY
    );

    mutation.mutate(
      {
        ...data,
        phone: normalizedPhone ?? data.phone,
        emergency_contact_phone:
          normalizedEmergencyPhone ?? data.emergency_contact_phone,
        event_id: props.eventId,
        selected_date: props.selectedDate,
      },
      {
        onSuccess: (registration) => {
          setSubmittedAmount(registration.amount_due);
          setSubmittedEmail(data.email);
        },
        onError: (err) => {
          const code =
            err instanceof ApiError ? (err.code ?? "UNKNOWN") : "UNKNOWN";
          const translated = tApiError(code);
          const message =
            translated !== code
              ? translated
              : err instanceof Error
                ? err.message
                : tApiError("UNKNOWN");
          methods.setError("root", { message });
        },
      }
    );
  }

  async function handleNext() {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    const valid = await methods.trigger(fieldsToValidate);
    if (valid) setCurrentStep((prev) => prev + 1);
  }

  function onBackClick() {
    setCurrentStep((prev) => prev - 1);
  }

  function onSubmitClick() {
    formRef.current?.requestSubmit();
  }

  function onBackdropClick() {
    if (!methods.formState.isDirty) {
      props.onClose();
    }
  }

  const isSubmitted = submittedAmount !== null;

  return (
    <Overlay
      open={props.open}
      onBackdropClick={isSubmitted ? props.onClose : onBackdropClick}
    >
      <FormProvider {...methods}>
        <ModalCard
          ref={useCallback((node: HTMLDivElement | null) => {
            node?.focus();
            return () => {};
          }, [])}
          tabIndex={-1}
          className={cn(
            "w-full max-w-lg outline-none",
            !isSubmitted && "max-h-[90vh]"
          )}
        >
          <ModalCard.Header
            title={isSubmitted ? t("successTitle") : t("title")}
          >
            <ModalCard.Header.CloseButton onClick={props.onClose} />
          </ModalCard.Header>
          <ModalCard.Main>
            {isSubmitted ? (
              <SuccessMainContent
                amount={submittedAmount}
                paymentDays={props.paymentDays}
                eventTitle={props.eventTitle}
                eventDate={props.eventDate}
                eventLocation={props.eventLocation}
                email={submittedEmail}
              />
            ) : (
              <FormMainContent
                formRef={formRef}
                currentStep={currentStep}
                basePrice={props.basePrice}
                carpoolSurcharge={props.carpoolSurcharge}
                carpoolEnabled={props.carpoolEnabled}
                rentalEnabled={props.rentalEnabled}
                onSubmit={methods.handleSubmit(handleRegistrationSubmit)}
              />
            )}
          </ModalCard.Main>
          <ModalCard.Footer>
            {isSubmitted ? (
              <div className="flex w-full justify-end">
                <Button theme="solid" onClick={props.onClose}>
                  {t("successConfirm")}
                </Button>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4">
                <ProgressBar
                  showPercentage
                  totalSteps={TOTAL_STEPS}
                  currentStep={currentStep}
                />
                <div className="flex justify-between">
                  {currentStep === 0 ? (
                    <Button theme="outline" onClick={props.onClose}>
                      {t("cancel")}
                    </Button>
                  ) : (
                    <Button theme="text" onClick={onBackClick}>
                      {t("back")}
                    </Button>
                  )}
                  {currentStep < TOTAL_STEPS - 1 ? (
                    <Button theme="solid" onClick={handleNext}>
                      {t("next")}
                    </Button>
                  ) : (
                    <Button theme="solid" onClick={onSubmitClick}>
                      {t("submit")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </ModalCard.Footer>
        </ModalCard>
      </FormProvider>
    </Overlay>
  );
};

RegistrationModal.displayName = "RegistrationModal";
export default RegistrationModal;

interface SuccessMainContentProps {
  amount: number;
  paymentDays: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  email: string;
}

const SuccessMainContent = (props: SuccessMainContentProps) => {
  const t = useTranslations("registration");
  const format = useFormatter();
  const [copied, setCopied] = useState(false);

  const paymentDeadline = new Date();
  paymentDeadline.setDate(paymentDeadline.getDate() + props.paymentDays);
  const formattedDeadline = format.dateTime(paymentDeadline, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  function onCopyAccount() {
    const raw = paymentAccount.bankAccount.replace(/[-\s]/g, "");
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <IconCircleCheck className="size-12 text-success" />

      <div className="w-full rounded-lg border border-stroke-default p-4 space-y-2">
        <dl className="typo-ui text-sm text-primary space-y-1">
          <div className="flex justify-between">
            <dt className="text-secondary">{t("successEventTitle")}</dt>
            <dd>{props.eventTitle}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-secondary">{t("successEventDate")}</dt>
            <dd>{props.eventDate}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-secondary">{t("successEventLocation")}</dt>
            <dd>{props.eventLocation}</dd>
          </div>
        </dl>
      </div>

      <p className="typo-body-2 text-secondary">
        {t("successTransferTo", { days: props.paymentDays })}
      </p>

      <div className="w-full rounded-lg border border-stroke-default p-4 space-y-3">
        <p className="typo-subtitle-1 text-xl text-accent">
          NT$ {format.number(props.amount)}
        </p>
        <div className="typo-ui text-sm text-primary space-y-1">
          <p>{paymentAccount.bankName}</p>
          <div className="flex items-center gap-1.5">
            <span>{paymentAccount.bankAccount}</span>
            <button
              type="button"
              onClick={onCopyAccount}
              className="inline-flex items-center justify-center size-6 rounded-lg border border-neutral-100/50 bg-neutral-50 text-neutral-300 transition-colors hover:text-neutral-400"
              aria-label={t("copyAccount")}
            >
              <IconCopy className="size-3.5" />
            </button>
            {copied && (
              <span className="typo-ui text-xs text-neutral-300">
                {t("copied")}
              </span>
            )}
          </div>
          <p>
            {t("successAccountHolder")}：{paymentAccount.accountHolder}
          </p>
          <div className="flex justify-between pt-1 border-t border-stroke-default">
            <span className="text-secondary">
              {t("successPaymentDeadline")}
            </span>
            <span className="text-accent">{formattedDeadline}</span>
          </div>
        </div>
      </div>

      <p className="typo-body-2 text-sm text-secondary text-center">
        {t("successEmailSent", { email: props.email })}
      </p>

      <p className="typo-body-2 text-sm text-secondary text-center">
        {t("successReportDigits")}
      </p>
    </div>
  );
};

SuccessMainContent.displayName = "SuccessMainContent";

interface FormMainContentProps {
  formRef: React.RefObject<HTMLFormElement | null>;
  currentStep: number;
  basePrice: number;
  carpoolSurcharge: number;
  carpoolEnabled: boolean;
  rentalEnabled: boolean;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

const FormMainContent = (props: FormMainContentProps) => {
  const { formState } = useFormContext<RegistrationFormInput>();

  return (
    <>
      <form id={FORM_ID} ref={props.formRef} onSubmit={props.onSubmit}>
        <FormRegistration
          step={props.currentStep}
          basePrice={props.basePrice}
          carpoolSurcharge={props.carpoolSurcharge}
          carpoolEnabled={props.carpoolEnabled}
          rentalEnabled={props.rentalEnabled}
        />
      </form>
      {formState.errors.root && (
        <p className="typo-ui text-sm text-critical mt-2">
          {formState.errors.root.message}
        </p>
      )}
    </>
  );
};

FormMainContent.displayName = "FormMainContent";

interface FormRegistrationProps {
  step: number;
  basePrice: number;
  carpoolSurcharge: number;
  carpoolEnabled: boolean;
  rentalEnabled: boolean;
}

const FormRegistration = (props: FormRegistrationProps) => {
  return (
    <div className="space-y-6">
      {props.step === 0 && <FormStepBasic />}
      {props.step === 1 && <FormStepIdentity />}
      {props.step === 2 && <FormStepEmergency />}
      {props.step === 3 && (
        <FormStepActivity rentalEnabled={props.rentalEnabled} />
      )}
      {props.step === 4 && (
        <FormStepTransport
          basePrice={props.basePrice}
          carpoolSurcharge={props.carpoolSurcharge}
          carpoolEnabled={props.carpoolEnabled}
        />
      )}
    </div>
  );
};

FormRegistration.displayName = "FormRegistration";

const FormStepBasic = () => {
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

FormStepBasic.displayName = "FormStepBasic";

const FormStepIdentity = () => {
  const t = useTranslations("registration");
  const { control, formState, setValue, getValues } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const country = useWatch({ control, name: "country" });
  const countryRule = getCountryByIso(country) ?? FALLBACK_COUNTRY;

  useEffect(
    function prefillDialCode() {
      const currentPhone = getValues("phone");
      if (currentPhone === "" || currentPhone === "+") {
        setValue("phone", countryRule.dialCode);
      }
    },
    [countryRule.dialCode]
  );

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

FormStepIdentity.displayName = "FormStepIdentity";

const FormStepEmergency = () => {
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

FormStepEmergency.displayName = "FormStepEmergency";

interface FormStepActivityProps {
  rentalEnabled: boolean;
}

const FormStepActivity = (props: FormStepActivityProps) => {
  const t = useTranslations("registration");
  const { register, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const {
    wantsRental,
    clothingSize,
    shoeSize,
    onRentalToggle,
    onClothingSizeChange,
    onShoeSizeChange,
    clothingSizeOptions,
    shoeSizeOptions,
  } = useRentalDetailsForm();

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

      {props.rentalEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="typo-ui text-sm text-primary">
              {t("wantsRental")}
            </span>
            <Switch
              checked={wantsRental}
              onChange={(e) => onRentalToggle(e.target.checked)}
            />
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300",
              wantsRental ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden space-y-3">
              <Selector
                label={t("clothingSize")}
                placeholder={t("selectClothingSize")}
                options={clothingSizeOptions}
                value={clothingSize}
                onChange={onClothingSizeChange}
              />
              <Selector
                label={t("shoeSize")}
                placeholder={t("selectShoeSize")}
                options={shoeSizeOptions}
                value={shoeSize}
                onChange={onShoeSizeChange}
              />
            </div>
          </div>
        </div>
      )}

      <Input
        label={t("notes")}
        placeholder={t("notesPlaceholder")}
        {...register("notes")}
        error={errors.notes?.message}
      />
    </fieldset>
  );
};

FormStepActivity.displayName = "FormStepActivity";

interface FormStepTransportProps {
  basePrice: number;
  carpoolSurcharge: number;
  carpoolEnabled: boolean;
}

const FormStepTransport = (props: FormStepTransportProps) => {
  const t = useTranslations("registration");
  const format = useFormatter();
  const { register, watch, control, formState, setValue } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const transport = watch("transport");
  const carpoolRole = watch("carpool_role");

  useEffect(
    function lockTransportOnDisabled() {
      if (!props.carpoolEnabled) {
        setValue("transport", "self");
        setValue("pickup_location", null);
        setValue("carpool_role", null);
        setValue("seat_count", null);
      }
    },
    [props.carpoolEnabled]
  );

  useEffect(
    function resetCarpoolFieldsOnSelf() {
      if (transport !== "self") return;
      setValue("pickup_location", null);
      setValue("carpool_role", null);
      setValue("seat_count", null);
    },
    [transport]
  );

  const totalPrice =
    transport === "carpool"
      ? props.basePrice + props.carpoolSurcharge
      : props.basePrice;

  const seatCountOptions = SEAT_COUNT_VALUES.map((value) => ({
    value: String(value),
    label: t("seatCountOption", { count: value }),
  }));

  return (
    <>
      <fieldset className="space-y-3">
        <div className="space-y-1">
          <span className="typo-ui text-sm text-primary">{t("transport")}</span>
          {props.carpoolEnabled ? (
            <>
              <div className="flex flex-wrap gap-2">
                <RadioOption
                  variant="outlined"
                  label={t("transportSelf")}
                  value="self"
                  {...register("transport")}
                />
                <RadioOption
                  variant="outlined"
                  label={`${t("transportCarpool")}  +NT$ ${format.number(props.carpoolSurcharge)}`}
                  value="carpool"
                  {...register("transport")}
                />
              </div>
              {errors.transport && (
                <p className="typo-ui text-xs text-critical">
                  {errors.transport.message}
                </p>
              )}
            </>
          ) : (
            <p className="typo-ui text-sm text-secondary">
              {t("transportSelf")}
            </p>
          )}
        </div>

        {props.carpoolEnabled && (
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
                  {PICKUP_LOCATIONS.map((loc) => (
                    <RadioOption
                      variant="outlined"
                      key={loc}
                      label={loc}
                      value={loc}
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
                  carpoolRole === "driver"
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
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
        )}
      </fieldset>

      <div className="flex items-center justify-between rounded-lg border border-stroke-default p-4">
        <span className="typo-ui text-primary">{t("totalPrice")}</span>
        <span className="typo-subtitle-1 text-accent">
          NT$ {format.number(totalPrice)}
        </span>
      </div>
    </>
  );
};

FormStepTransport.displayName = "FormStepTransport";

const FORM_ID = "registration-form";

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

const TOTAL_STEPS = 5;

const STEP_FIELDS: Record<number, (keyof RegistrationFormInput)[]> = {
  0: ["name", "email", "gender", "birthday", "country"],
  1: ["phone", "id_number", "line_id"],
  2: ["guardian_consent", "emergency_contact_name", "emergency_contact_phone"],
  3: ["dietary", "notes"],
  4: ["transport", "pickup_location", "carpool_role", "seat_count"],
};
