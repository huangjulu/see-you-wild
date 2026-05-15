"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle as IconCheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/ui/atoms/Button";
import Input from "@/components/ui/atoms/Input";
import TextArea from "@/components/ui/atoms/TextArea";
import Selector from "@/components/ui/molecules/Selector";
import { contactApi } from "@/lib/api/contact.api";
import { useTranslations } from "@/lib/i18n/client";
import {
  type ContactFormInput,
  contactFormSchema,
} from "@/lib/validations/contact";

interface ContactFormProps {
  template: string;
}

const ACTIVITY_TYPE_OPTIONS = ["hot-spring", "camping", "canyoning", "other"];
const GROUP_SIZE_OPTIONS = ["4", "5-9", "10-15", "16-20", "20+"];
const DURATION_OPTIONS = ["1day", "2d1n", "3d2n", "flexible"];

const TEMPLATE_PREFILLS: Record<
  string,
  { activityType: string; groupSize: string; duration: string }
> = {
  group4: { activityType: "hot-spring", groupSize: "4", duration: "2d1n" },
  private: { activityType: "", groupSize: "10-15", duration: "2d1n" },
  custom: { activityType: "", groupSize: "", duration: "" },
};

const ContactForm = (props: ContactFormProps) => {
  const t = useTranslations("contact");
  const mutation = contactApi.useSubmit();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      template: "group4" as const,
      name: "",
      email: "",
      phone: "",
      activityType: "hot-spring",
      groupSize: "4",
      preferredDate: "",
      duration: "2d1n",
      message: "",
    },
  });

  const activityTypeValue = watch("activityType") ?? "";
  const groupSizeValue = watch("groupSize") ?? "";
  const durationValue = watch("duration") ?? "";

  useEffect(
    function syncTemplatePrefills() {
      const prefill = TEMPLATE_PREFILLS[props.template];
      if (!prefill) return;

      const templateValue: "group4" | "private" | "custom" =
        props.template === "private"
          ? "private"
          : props.template === "custom"
            ? "custom"
            : "group4";
      setValue("template", templateValue);

      if (!dirtyFields.activityType) {
        setValue("activityType", prefill.activityType);
      }
      if (!dirtyFields.groupSize) {
        setValue("groupSize", prefill.groupSize);
      }
      if (!dirtyFields.duration) {
        setValue("duration", prefill.duration);
      }
    },
    [props.template, dirtyFields, setValue]
  );

  async function handleContactSubmit(data: ContactFormInput) {
    await mutation.mutateAsync(data, {
      onSuccess: () => {
        reset();
      },
    });
  }

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center bg-white rounded-xl border border-neutral-100">
        <IconCheckCircle className="h-12 w-12 text-success mb-2" />
        <h2 className="typo-heading text-primary">{t("success.title")}</h2>
        <p className="typo-body text-secondary">{t("success.message")}</p>
      </div>
    );
  }

  const activityOptions = ACTIVITY_TYPE_OPTIONS.map((value) => ({
    value,
    label: t(
      `options.activityType.${value as "hot-spring" | "camping" | "canyoning" | "other"}`
    ),
  }));

  const groupSizeOptions = GROUP_SIZE_OPTIONS.map((value) => ({
    value,
    label: t(
      `options.groupSize.${value as "4" | "5-9" | "10-15" | "16-20" | "20+"}`
    ),
  }));

  const durationOptions = DURATION_OPTIONS.map((value) => ({
    value,
    label: t(
      `options.duration.${value as "1day" | "2d1n" | "3d2n" | "flexible"}`
    ),
  }));

  return (
    <form
      onSubmit={handleSubmit(handleContactSubmit)}
      className="space-y-8"
      noValidate
    >
      {/* Section 1: Contact Info */}
      <fieldset className="space-y-4">
        <legend className="typo-ui text-sm font-medium text-primary mb-2">
          {t("sections.contactInfo")}
        </legend>
        <Input
          label={t("fields.name")}
          {...register("name")}
          error={errors.name?.message}
          required
        />
        <Input
          label={t("fields.email")}
          type="email"
          {...register("email")}
          error={errors.email?.message}
          required
        />
        <Input
          label={t("fields.phone")}
          {...register("phone")}
          error={errors.phone?.message}
        />
      </fieldset>

      {props.template !== "custom" && (
        <fieldset className="space-y-4">
          <legend className="typo-ui text-sm font-medium text-primary mb-2">
            {t("sections.tripInfo")}
          </legend>
          <Selector
            label={t("fields.activityType")}
            options={activityOptions}
            value={activityTypeValue}
            onChange={(val) =>
              setValue("activityType", val, { shouldDirty: true })
            }
            error={errors.activityType?.message}
          />
          <Selector
            label={t("fields.groupSize")}
            options={groupSizeOptions}
            value={groupSizeValue}
            onChange={(val) =>
              setValue("groupSize", val, { shouldDirty: true })
            }
            error={errors.groupSize?.message}
          />
          <Input
            label={t("fields.preferredDate")}
            placeholder={t("fields.preferredDatePlaceholder")}
            {...register("preferredDate")}
            error={errors.preferredDate?.message}
          />
          <Selector
            label={t("fields.duration")}
            options={durationOptions}
            value={durationValue}
            onChange={(val) => setValue("duration", val, { shouldDirty: true })}
            error={errors.duration?.message}
          />
        </fieldset>
      )}

      {/* Section 3: Notes */}
      <fieldset className="space-y-4">
        <legend className="typo-ui text-sm font-medium text-primary mb-2">
          {t("sections.notes")}
        </legend>
        <TextArea
          placeholder={t(
            `placeholders.${props.template as "group4" | "private" | "custom"}`
          )}
          {...register("message")}
          error={errors.message?.message}
        />
      </fieldset>

      {mutation.error != null && (
        <p className="typo-body text-sm text-critical">
          {t("error.submitFailed")}
        </p>
      )}

      <Button theme="solid" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
};

ContactForm.displayName = "ContactForm";
export default ContactForm;
