"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import Input from "@/components/ui/atoms/Input";
import Overlay from "@/components/ui/atoms/Overlay";
import DrawerCalendar from "@/components/ui/molecules/DrawerCalendar";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Selector from "@/components/ui/molecules/Selector";
import { adminApi } from "@/lib/api/admin.api";
import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const eventFormSchema = z
  .object({
    title: z.string().min(1, ""),
    type: z.string().min(1, ""),
    location: z.string().min(1, ""),
    start_date: z.string().date(""),
    end_date: z.string().date(""),
    base_price: z.number().int().positive(""),
    carpool_surcharge: z.number().int().positive(""),
    driver_refund_per_passenger: z.number().int().min(0, ""),
    payment_days: z.number().int().positive(""),
    carpool_cutoff_days: z.number().int().min(0, ""),
    min_participants: z.number().int().min(1, ""),
    status: z.enum(["open", "closed"]),
    image_url: z.string().url().nullable(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "結束日期必須晚於或等於開始日期",
    path: ["end_date"],
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  event: EventListDto | null;
}

const EventFormModal: React.FC<EventFormModalProps> = (props) => {
  const isEditMode = props.event != null;
  const createMutation = adminApi.events.useCreate();
  const updateMutation = adminApi.events.useUpdate();
  const uploadMutation = adminApi.uploadImage();
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const defaultValues: EventFormValues = {
    title: "",
    type: "",
    location: "",
    start_date: "",
    end_date: "",
    base_price: 0,
    carpool_surcharge: 0,
    driver_refund_per_passenger: 0,
    payment_days: 3,
    carpool_cutoff_days: 3,
    min_participants: 3,
    status: "open",
    image_url: null,
  };

  function buildValues(event: EventListDto): EventFormValues {
    return {
      title: event.title,
      type: event.type,
      location: event.location,
      start_date: event.start_date,
      end_date: event.end_date,
      base_price: event.base_price,
      carpool_surcharge: event.carpool_surcharge,
      driver_refund_per_passenger: event.driver_refund_per_passenger,
      payment_days: event.payment_days,
      carpool_cutoff_days: event.carpool_cutoff_days,
      min_participants: event.min_participants,
      status: event.status,
      image_url: event.image_url,
    };
  }

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    values: props.event != null ? buildValues(props.event) : defaultValues,
  });

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadMutation.isPending;

  async function handleFormSubmit(values: EventFormValues) {
    let imageUrl = values.image_url;

    if (pendingFile) {
      const result = await uploadMutation.mutateAsync(pendingFile);
      imageUrl = result.url;
    }

    const finalValues = { ...values, image_url: imageUrl };

    if (props.event != null) {
      updateMutation.mutate(
        { eventId: props.event.id, data: finalValues },
        {
          onSuccess: () => {
            setPendingFile(null);
            props.onClose();
          },
        }
      );
    } else {
      const payload = { ...finalValues, id: crypto.randomUUID() };
      createMutation.mutate(payload, {
        onSuccess: () => {
          setPendingFile(null);
          props.onClose();
        },
      });
    }
  }

  return (
    <Overlay open={props.open} onBackdropClick={props.onClose}>
      <ModalCard className="w-full max-w-lg max-h-[90vh]">
        <ModalCard.Header title={isEditMode ? "編輯活動" : "新增活動"}>
          <ModalCard.Header.CloseButton onClick={props.onClose} />
        </ModalCard.Header>
        <ModalCard.Main>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <ImageUploadField
                imageUrl={methods.watch("image_url")}
                pendingFile={pendingFile}
                onFileSelect={setPendingFile}
              />
              <EventFormFields />
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

EventFormModal.displayName = "EventFormModal";
export default EventFormModal;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ImageUploadFieldProps {
  imageUrl: string | null;
  pendingFile: File | null;
  onFileSelect: (file: File | null) => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = (props) => {
  const preview = props.pendingFile
    ? URL.createObjectURL(props.pendingFile)
    : props.imageUrl;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    props.onFileSelect(file);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="typo-ui text-sm text-primary">封面照片</span>
      {preview != null && (
        <img
          src={preview}
          alt="活動圖片預覽"
          className="h-32 w-full rounded-md border border-stroke-default object-cover"
        />
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className={cn(
          "typo-body text-sm text-secondary",
          "file:mr-3 file:rounded-md file:border file:border-stroke-default file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-primary",
          "file:cursor-pointer file:transition-colors file:hover:border-stroke-strong"
        )}
      />
    </div>
  );
};

ImageUploadField.displayName = "ImageUploadField";

const EventFormFields: React.FC = () => {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<EventFormValues>();

  const startDate = useWatch({ control, name: "start_date" });

  const minStartDate = new Date();
  minStartDate.setDate(minStartDate.getDate() + 3);
  minStartDate.setHours(0, 0, 0, 0);

  const minEndDate = startDate
    ? new Date(startDate + "T00:00:00")
    : minStartDate;

  function onStartDateChange(value: string) {
    setValue("start_date", value);
    const currentEnd = getValues("end_date");
    if (!currentEnd || currentEnd < value) {
      setValue("end_date", value);
    }
  }

  return (
    <>
      <fieldset className="space-y-3">
        <legend className="typo-sub-heading text-sm text-brand-500">
          基本資訊
        </legend>
        <Input
          label="活動標題"
          placeholder="例：2025 夏日太平山野營"
          {...register("title")}
          error={errors.title?.message}
        />
        <Input
          label="活動類型"
          placeholder="例：camping, hiking, SUP"
          {...register("type")}
          error={errors.type?.message}
        />
        <Input
          label="活動地點"
          {...register("location")}
          error={errors.location?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <DrawerCalendar
                label="活動開始日"
                placeholder="選擇日期"
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  onStartDateChange(v);
                }}
                onBlur={field.onBlur}
                error={errors.start_date?.message}
                minDate={minStartDate}
                startYear={new Date().getFullYear()}
                endYear={new Date().getFullYear() + 2}
              />
            )}
          />
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <DrawerCalendar
                label="活動結束日"
                placeholder="選擇日期"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.end_date?.message}
                minDate={minEndDate}
                startYear={new Date().getFullYear()}
                endYear={new Date().getFullYear() + 2}
              />
            )}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="typo-sub-heading text-sm text-brand-500">
          費用設定
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Input
              label="每人費用（元）"
              type="number"
              icon={<span className="opacity-50">$</span>}
              {...register("base_price", { valueAsNumber: true })}
              error={errors.base_price?.message}
            />
            <p className="text-[11px] text-secondary">
              不含共乘加價，為報名者的基本費用
            </p>
          </div>
          <Input
            label="共乘交通加價（元）"
            type="number"
            placeholder="例：500"
            icon={<span className="opacity-50">$</span>}
            {...register("carpool_surcharge", { valueAsNumber: true })}
            error={errors.carpool_surcharge?.message}
          />
        </div>
        <Input
          label="司機退款/人"
          type="number"
          icon={<span className="opacity-50">$</span>}
          {...register("driver_refund_per_passenger", {
            valueAsNumber: true,
          })}
          error={errors.driver_refund_per_passenger?.message}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="typo-sub-heading text-sm text-brand-500">
          報名規則
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Input
              label="報名後付款期限（天）"
              type="number"
              placeholder="例：3"
              {...register("payment_days", { valueAsNumber: true })}
              error={errors.payment_days?.message}
            />
            <p className="text-[11px] text-secondary">
              報名後 N 天內未完成匯款，報名自動失效
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Input
              label="共乘報名截止（活動前幾天）"
              type="number"
              placeholder="例：5"
              {...register("carpool_cutoff_days", { valueAsNumber: true })}
              error={errors.carpool_cutoff_days?.message}
            />
            <p className="text-[11px] text-secondary">
              活動前 N 天停止受理共乘登記
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Input
            label="最低成團人數（人）"
            type="number"
            placeholder="例：8"
            {...register("min_participants", { valueAsNumber: true })}
            error={errors.min_participants?.message}
          />
          <p className="text-[11px] text-secondary">未達人數將通知退費取消</p>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="typo-sub-heading text-sm text-brand-500">
          上架設定
        </legend>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Selector
              label="報名開放"
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.status?.message}
            />
          )}
        />
      </fieldset>
    </>
  );
};

EventFormFields.displayName = "EventFormFields";

const STATUS_OPTIONS = [
  { value: "open", label: "開放報名" },
  { value: "closed", label: "已關閉" },
];
