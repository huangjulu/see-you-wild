"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck as IconCircleCheck } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";

import Button from "@/components/ui/atoms/Button";
import Input from "@/components/ui/atoms/Input";
import Overlay from "@/components/ui/atoms/Overlay";
import ProgressBar from "@/components/ui/atoms/ProgressBar";
import RadioOption from "@/components/ui/atoms/RadioOption";
import Switch from "@/components/ui/atoms/Switch";
import DatePickerInput from "@/components/ui/molecules/DatePickerInput";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Selector from "@/components/ui/molecules/Selector";
import { registrationApi } from "@/lib/api/registration.api";
import { useTranslations } from "@/lib/i18n/client";
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
              <SuccessMainContent amount={submittedAmount} />
            ) : (
              <FormMainContent
                formRef={formRef}
                currentStep={currentStep}
                basePrice={props.basePrice}
                carpoolSurcharge={props.carpoolSurcharge}
                pickupLocations={props.pickupLocations}
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
                      Back
                    </Button>
                  )}
                  {currentStep < TOTAL_STEPS - 1 ? (
                    <Button theme="solid" onClick={handleNext}>
                      Next
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

const SuccessMainContent: React.FC<{ amount: number }> = (props) => {
  const t = useTranslations("registration");

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <IconCircleCheck className="size-12 text-success" />

      <div className="w-full space-y-4">
        <div className="rounded-lg border border-stroke-default p-4 space-y-2">
          <p className="typo-body-2 text-secondary">{t("successTransferTo")}</p>
          <p className="typo-subtitle-1 text-accent-fg">
            NT$ {props.amount.toLocaleString("zh-TW")}
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
  pickupLocations: string[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const FormMainContent: React.FC<FormMainContentProps> = (props) => {
  const t = useTranslations("registration");
  const { formState } = useFormContext<RegistrationFormInput>();

  return (
    <>
      <form id={FORM_ID} ref={props.formRef} onSubmit={props.onSubmit}>
        <FormRegistration
          step={props.currentStep}
          basePrice={props.basePrice}
          carpoolSurcharge={props.carpoolSurcharge}
          pickupLocations={props.pickupLocations}
        />
      </form>
      {formState.errors.root != null && (
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
  pickupLocations: string[];
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
  const { register, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
      <legend className="typo-subtitle-2 text-primary mb-2">
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
  );
};

FormStepBasic.displayName = "FormStepBasic";

const FormStepIdentity: React.FC = () => {
  const t = useTranslations("registration");
  const { register, control, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
      <legend className="typo-subtitle-2 text-primary mb-2">
        {t("sectionIdentity")}
      </legend>

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
        {errors.gender != null && (
          <p className="typo-ui text-xs text-critical">
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
      <Controller
        name="birthday"
        control={control}
        render={({ field }) => (
          <DatePickerInput
            label={t("birthday")}
            placeholder={t("birthdayPlaceholder")}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.birthday?.message}
          />
        )}
      />
    </fieldset>
  );
};

FormStepIdentity.displayName = "FormStepIdentity";

const FormStepEmergency: React.FC = () => {
  const t = useTranslations("registration");
  const { register, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
      <legend className="typo-subtitle-2 text-primary mb-2">
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
  );
};

FormStepEmergency.displayName = "FormStepEmergency";

const FormStepActivity: React.FC = () => {
  const t = useTranslations("registration");
  const { register, formState } = useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  return (
    <fieldset className="space-y-3">
      <legend className="typo-subtitle-2 text-primary mb-2">
        {t("sectionActivity")}
      </legend>

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
        {errors.dietary != null && (
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
  const { register, watch, control, formState } =
    useFormContext<RegistrationFormInput>();
  const errors = formState.errors;

  const transport = watch("transport");
  const carpoolRole = watch("carpool_role");

  const totalPrice =
    transport === "carpool"
      ? props.basePrice + props.carpoolSurcharge
      : props.basePrice;

  return (
    <>
      <fieldset className="space-y-3">
        <legend className="typo-subtitle-2 text-primary mb-2">
          {t("sectionTransport")}
        </legend>

        <div className="space-y-1">
          <span className="typo-ui text-sm text-primary">{t("transport")}</span>
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
                    label={PICKUP_SLUG_TO_DISPLAY[slug] ?? slug}
                    value={slug}
                    {...register("pickup_location")}
                  />
                ))}
              </div>
              {errors.pickup_location != null && (
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
              {errors.carpool_role != null && (
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
                      placeholder="選擇人數"
                      options={SEAT_COUNT_OPTIONS}
                      value={
                        field.value != null ? String(field.value) : undefined
                      }
                      onChange={(v) => field.onChange(Number(v))}
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
          NT$ {totalPrice.toLocaleString("zh-TW")}
        </span>
      </div>
    </>
  );
};

FormStepTransport.displayName = "FormStepTransport";

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

const SEAT_COUNT_OPTIONS = [
  { value: "3", label: "3 人" },
  { value: "4", label: "4 人" },
  { value: "5", label: "5 人" },
];

const TOTAL_STEPS = 5;

const STEP_FIELDS: Record<number, (keyof RegistrationFormInput)[]> = {
  0: ["name", "email", "phone", "line_id"],
  1: ["gender", "id_number", "birthday"],
  2: ["emergency_contact_name", "emergency_contact_phone"],
  3: ["dietary", "wants_rental", "notes"],
  4: ["transport", "pickup_location", "carpool_role", "seat_count"],
};
