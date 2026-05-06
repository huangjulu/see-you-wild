"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck as IconCircleCheck } from "lucide-react";
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
import { registrationApi } from "@/lib/api/registration.api";
import {
  calculateAge,
  type CountryRule,
  getCountryByIso,
} from "@/lib/form-rules";
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
  pickupLocations: string[];
}

const RegistrationModal: React.FC<RegistrationModalProps> = (props) => {
  const t = useTranslations("registration");
  const tValidation = useTranslations("validation");
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null);

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(registrationFormSchema, {
      error: createRegistrationErrorMap(tValidation),
    }),
    defaultValues: {
      name: "",
      email: "",
      phone: "+886",
      line_id: null,
      country: "TW",
      gender: "male",
      id_number: "",
      birthday: "",
      guardian_consent: null,
      emergency_contact_name: "",
      emergency_contact_phone: "+886",
      dietary: "omnivore",
      wants_rental: false,
      notes: null,
      transport: props.isSelfArrival ? "self" : "carpool",
      pickup_location: null,
      carpool_role: null,
      seat_count: null,
    },
  });

  async function handleRegistrationSubmit(data: RegistrationFormInput) {
    if (methods.formState.isSubmitting) return;

    try {
      const registration = await registrationApi.create({
        ...data,
        event_id: props.eventId,
      });
      setSubmittedAmount(registration.amount_due);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("submitError");
      methods.setError("root", { message });
    }
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
                eventTitle={props.eventTitle}
                eventLocation={props.eventLocation}
                eventDate={props.eventDate}
              />
            ) : (
              <FormMainContent
                formRef={formRef}
                currentStep={currentStep}
                basePrice={props.basePrice}
                carpoolSurcharge={props.carpoolSurcharge}
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
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
}

const SuccessMainContent: React.FC<SuccessMainContentProps> = (props) => {
  const t = useTranslations("registration");
  const format = useFormatter();
  const { getValues } = useFormContext<RegistrationFormInput>();
  const name = getValues("name");
  const email = getValues("email");
  const transport = getValues("transport");

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <IconCircleCheck className="size-12 text-success" />

      <div className="w-full space-y-4">
        <div className="rounded-lg border border-stroke-default p-4 space-y-2">
          <p className="typo-ui text-sm text-secondary">
            {t("successEventSummary")}
          </p>
          <p className="typo-subtitle-1 text-primary">{props.eventTitle}</p>
          <p className="typo-body-2 text-sm text-secondary">
            {props.eventLocation} · {props.eventDate}
          </p>
        </div>

        <div className="rounded-lg border border-stroke-default p-4 space-y-2">
          <p className="typo-ui text-sm text-secondary">
            {t("successRegistrationSummary")}
          </p>
          <div className="typo-body-2 text-sm text-primary space-y-1">
            <p>
              {t("name")}：{name}
            </p>
            <p>
              {t("transport")}：
              {transport === "self"
                ? t("transportSelf")
                : t("transportCarpool")}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-stroke-default p-4 space-y-2">
          <p className="typo-body-2 text-secondary">{t("successTransferTo")}</p>
          <p className="typo-subtitle-1 text-accent-fg">
            NT$ {format.number(props.amount)}
          </p>
          <div className="typo-ui text-sm text-primary space-y-1">
            <p>
              {paymentAccount.bankName}　{paymentAccount.bankAccount}
            </p>
            <p>
              {t("successAccountHolder")}：{paymentAccount.accountHolder}
            </p>
          </div>
        </div>

        <p className="typo-body-2 text-sm text-secondary text-center">
          {t("successEmailSent", { email })}
        </p>

        <p className="typo-body-2 text-sm text-secondary text-center">
          {t("successReportDigits")}
        </p>
      </div>
    </div>
  );
};

SuccessMainContent.displayName = "SuccessMainContent";

interface FormMainContentProps {
  formRef: React.RefObject<HTMLFormElement | null>;
  currentStep: number;
  basePrice: number;
  carpoolSurcharge: number;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const FormMainContent: React.FC<FormMainContentProps> = (props) => {
  const { formState } = useFormContext<RegistrationFormInput>();

  return (
    <>
      <form id={FORM_ID} ref={props.formRef} onSubmit={props.onSubmit}>
        <FormRegistration
          step={props.currentStep}
          basePrice={props.basePrice}
          carpoolSurcharge={props.carpoolSurcharge}
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
}

const FormRegistration: React.FC<FormRegistrationProps> = (props) => {
  return (
    <div className="space-y-6">
      {props.step === 0 && <FormStepBasic />}
      {props.step === 1 && <FormStepIdentity />}
      {props.step === 2 && <FormStepEmergency />}
      {props.step === 3 && <FormStepActivity />}
      {props.step === 4 && (
        <FormStepTransport
          basePrice={props.basePrice}
          carpoolSurcharge={props.carpoolSurcharge}
        />
      )}
    </div>
  );
};

FormRegistration.displayName = "FormRegistration";

const FormStepBasic: React.FC = () => {
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

const FormStepIdentity: React.FC = () => {
  const t = useTranslations("registration");
  const { control, setValue, getValues, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const country = useWatch({ control, name: "country" });
  const countryRule = getCountryByIso(country) ?? FALLBACK_COUNTRY;

  useEffect(
    function syncPhoneCountryDefault() {
      const currentPhone = getValues("phone");
      if (currentPhone === "" || isOnlyDialCode(currentPhone)) {
        setValue("phone", countryRule.dialCode, { shouldDirty: false });
      }
    },
    [country, countryRule.dialCode, getValues, setValue]
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

const FormStepEmergency: React.FC = () => {
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
                  className="mt-1 size-4 accent-brand-500"
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

const FormStepActivity: React.FC = () => {
  const t = useTranslations("registration");
  const { register, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
      <div className="space-y-1">
        <span className="typo-ui text-sm text-primary">{t("dietary")}</span>
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

FormStepActivity.displayName = "FormStepActivity";

interface FormStepTransportProps {
  basePrice: number;
  carpoolSurcharge: number;
}

const FormStepTransport: React.FC<FormStepTransportProps> = (props) => {
  const t = useTranslations("registration");
  const format = useFormatter();
  const { register, watch, control, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const transport = watch("transport");
  const carpoolRole = watch("carpool_role");

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
          <div className="flex flex-wrap gap-2">
            <RadioOption
              label={t("transportSelf")}
              value="self"
              {...register("transport")}
            />
            <RadioOption
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
                      value={
                        field.value != null ? String(field.value) : undefined
                      }
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

      <div className="flex items-center justify-between rounded-lg border border-stroke-default p-4">
        <span className="typo-ui text-primary">{t("totalPrice")}</span>
        <span className="typo-subtitle-1 text-accent-fg">
          NT$ {format.number(totalPrice)}
        </span>
      </div>
    </>
  );
};

FormStepTransport.displayName = "FormStepTransport";

const FORM_ID = "registration-form";

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

const TOTAL_STEPS = 5;

const STEP_FIELDS: Record<number, (keyof RegistrationFormInput)[]> = {
  0: ["name", "email", "gender", "birthday", "country"],
  1: ["phone", "id_number", "line_id"],
  2: ["guardian_consent", "emergency_contact_name", "emergency_contact_phone"],
  3: ["dietary", "wants_rental", "notes"],
  4: ["transport", "pickup_location", "carpool_role", "seat_count"],
};

function isOnlyDialCode(value: string): boolean {
  return /^\+\d{1,3}$/.test(value);
}
