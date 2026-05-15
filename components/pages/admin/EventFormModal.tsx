"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X as IconX } from "lucide-react";
import React, { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { zhTW } from "react-day-picker/locale";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";

import Input from "@/components/ui/atoms/Input";
import Overlay from "@/components/ui/atoms/Overlay";
import TextArea from "@/components/ui/atoms/TextArea";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Selector from "@/components/ui/molecules/Selector";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";
import type { EventListDto } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const eventFormSchema = z.object({
  title: z.string().min(1, "請輸入活動標題"),
  type: z.string().min(1, "請輸入活動類型"),
  location: z.string().min(1, "請輸入活動地點"),
  available_dates: z.array(z.string()).min(1, "請選擇至少一個日期"),
  base_price: z.number().int().positive("每人費用必須大於 0"),
  carpool_surcharge: z.number().int().positive("共乘加價必須大於 0"),
  driver_refund_per_passenger: z.number().int().min(0, "不可為負數"),
  payment_days: z.number().int().positive("付款期限至少 1 天"),
  carpool_cutoff_days: z.number().int().min(0, "不可為負數"),
  min_participants: z.number().int().min(1, "至少 1 人"),
  description: z.string(),
  pickup_locations: z.array(z.string()),
  safety_policy: z.string(),
  images: z.array(z.object({ src: z.string().url(), alt: z.string() })),
  status: z.enum(["open", "closed"]),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  event: EventListDto | null;
}

const EventFormModal = (props: EventFormModalProps) => {
  const { toast } = useToast();
  const isEditMode = props.event != null;
  const createMutation = adminApi.events.useCreate();
  const updateMutation = adminApi.events.useUpdate();
  const uploadMutation = adminApi.uploadImage();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const lockedDates = useMemo(() => {
    if (!props.event) return [];
    const dates = props.event.registrations
      .map((r) => r.selected_date)
      .filter((d): d is string => d != null);
    return Array.from(new Set(dates));
  }, [props.event]);

  const defaultValues: EventFormValues = {
    title: "",
    type: "",
    location: "",
    available_dates: [],
    base_price: 1000,
    carpool_surcharge: 500,
    driver_refund_per_passenger: 0,
    payment_days: 3,
    carpool_cutoff_days: 3,
    min_participants: 3,
    description: "",
    pickup_locations: [],
    safety_policy: "",
    images: [],
    status: "open",
  };

  function buildValues(event: EventListDto): EventFormValues {
    return {
      title: event.title,
      type: event.type,
      location: event.location,
      available_dates: Array.from(new Set(event.available_dates)),
      base_price: event.base_price,
      carpool_surcharge: event.carpool_surcharge,
      driver_refund_per_passenger: event.driver_refund_per_passenger,
      payment_days: event.payment_days,
      carpool_cutoff_days: event.carpool_cutoff_days,
      min_participants: event.min_participants,
      description: event.description,
      pickup_locations: event.pickup_locations,
      safety_policy: event.safety_policy,
      images: event.images,
      status: event.status,
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
    const uploadedUrls: string[] = [];
    for (const file of pendingFiles) {
      const result = await uploadMutation.mutateAsync(file);
      uploadedUrls.push(result.url);
    }

    const uploadedImages = uploadedUrls.map((url) => ({ src: url, alt: "" }));
    const allImages = [...values.images, ...uploadedImages];

    const sortedDates = [...values.available_dates].sort();
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    const finalValues = {
      ...values,
      images: allImages,
      start_date: startDate,
      end_date: endDate,
    };

    if (props.event != null) {
      updateMutation.mutate(
        { eventId: props.event.id, data: finalValues },
        {
          onSuccess: () => {
            toast.success("活動編輯成功");
            setPendingFiles([]);
            props.onClose();
          },
          onError: (err) => {
            toast.error("操作失敗", { description: err.message });
          },
        }
      );
    } else {
      const payload = { ...finalValues, id: crypto.randomUUID() };
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("活動建立成功");
          setPendingFiles([]);
          props.onClose();
        },
        onError: (err) => {
          toast.error("操作失敗", { description: err.message });
        },
      });
    }
  }

  return (
    <Overlay open={props.open} onBackdropClick={props.onClose}>
      <ModalCard className="w-full max-w-xl max-h-[90vh]">
        <ModalCard.Header title={isEditMode ? "編輯活動" : "新增活動"}>
          <ModalCard.Header.CloseButton onClick={props.onClose} />
        </ModalCard.Header>
        <ModalCard.Main>
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <MultiImageUploadField
                existingImages={methods.watch("images")}
                pendingFiles={pendingFiles}
                onPendingFilesChange={setPendingFiles}
                onRemoveExisting={(index) => {
                  const current = methods.getValues("images");
                  methods.setValue(
                    "images",
                    current.filter((_, i) => i !== index)
                  );
                }}
                onUpdateAlt={(index, alt) => {
                  const current = methods.getValues("images");
                  const updated = current.map((img, i) =>
                    i === index ? { ...img, alt } : img
                  );
                  methods.setValue("images", updated);
                }}
              />
              <EventFormFields lockedDates={lockedDates} />
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

interface MultiImageUploadFieldProps {
  existingImages: Array<{ src: string; alt: string }>;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onUpdateAlt: (index: number, alt: string) => void;
}

const MultiImageUploadField = (props: MultiImageUploadFieldProps) => {
  const totalCount = props.existingImages.length + props.pendingFiles.length;
  const maxReached = totalCount >= 3;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = 3 - totalCount;
    if (remaining <= 0) return;
    const newFiles = Array.from(files).slice(0, remaining);
    props.onPendingFilesChange([...props.pendingFiles, ...newFiles]);
    e.target.value = "";
  }

  function onRemovePending(index: number) {
    props.onPendingFilesChange(
      props.pendingFiles.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="typo-ui text-sm text-primary">封面照片</span>
      <div className="flex gap-4">
        {props.existingImages.map((img, index) => (
          <div
            key={img.src}
            className="relative flex flex-col items-center gap-1 shrink-0"
          >
            <div className="relative size-14">
              <img
                src={img.src}
                alt={img.alt || `活動圖片 ${index + 1}`}
                className="size-14 rounded-lg object-cover border border-stroke-default"
              />
              <button
                type="button"
                onClick={() => props.onRemoveExisting(index)}
                className={cn(
                  "absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full",
                  "bg-fill-critical text-on-fill-brand transition-colors hover:bg-critical"
                )}
              >
                <IconX className="size-3" />
              </button>
            </div>
            <input
              type="text"
              value={img.alt}
              onChange={(e) => props.onUpdateAlt(index, e.target.value)}
              placeholder="圖片描述（alt text）"
              className="w-14 text-[10px] text-secondary border-b border-stroke-default bg-transparent outline-none text-center"
            />
          </div>
        ))}
        {props.pendingFiles.map((file, index) => (
          <div key={file.name + index} className="relative size-14 shrink-0">
            <img
              src={URL.createObjectURL(file)}
              alt={`待上傳圖片 ${index + 1}`}
              className="size-14 rounded-lg object-cover border border-stroke-default"
            />
            <button
              type="button"
              onClick={() => onRemovePending(index)}
              className={cn(
                "absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full",
                "bg-fill-critical text-on-fill-brand transition-colors hover:bg-critical"
              )}
            >
              <IconX className="size-3" />
            </button>
          </div>
        ))}
      </div>
      {!maxReached && (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFileChange}
          className={cn(
            "typo-body text-sm text-secondary",
            "file:mr-3 file:rounded-md file:border file:border-stroke-default file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-primary",
            "file:cursor-pointer file:transition-colors file:hover:border-stroke-strong"
          )}
        />
      )}
    </div>
  );
};

MultiImageUploadField.displayName = "MultiImageUploadField";

interface EventFormFieldsProps {
  lockedDates: string[];
}

const EventFormFields = (props: EventFormFieldsProps) => {
  const lockedDates = props.lockedDates;
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EventFormValues>();

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  minDate.setHours(0, 0, 0, 0);

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
        <TextArea
          label="活動說明"
          placeholder="請輸入活動說明..."
          rows={4}
          {...register("description")}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="typo-ui text-sm text-primary">可選日期</legend>
        <Controller
          name="available_dates"
          control={control}
          render={({ field }) => (
            <AvailableDatesPicker
              value={field.value}
              onChange={field.onChange}
              minDate={minDate}
              lockedDates={lockedDates}
              error={errors.available_dates?.message}
            />
          )}
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="typo-ui text-sm text-primary">上車地點</legend>
        <Controller
          name="pickup_locations"
          control={control}
          render={({ field }) => (
            <PickupLocationsInput
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </fieldset>

      <div className="space-y-2">
        <span className="typo-ui text-sm text-primary">安全須知</span>
        <TextArea
          placeholder="請輸入活動安全須知..."
          rows={4}
          {...register("safety_policy")}
        />
      </div>

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

// ---------------------------------------------------------------------------
// AvailableDatesPicker — inline multi-select calendar
// ---------------------------------------------------------------------------

interface AvailableDatesPickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
  minDate: Date;
  lockedDates: string[];
  error?: string;
}

const AvailableDatesPicker = (props: AvailableDatesPickerProps) => {
  const selectedSet = useMemo(() => new Set(props.value), [props.value]);

  const selectedDates = useMemo(
    () => props.value.map((d) => new Date(d + "T00:00:00")),
    [props.value]
  );

  const lockedSet = useMemo(
    () => new Set(props.lockedDates),
    [props.lockedDates]
  );

  function onDayClick(day: Date) {
    const dateStr = formatDateToString(day);
    if (lockedSet.has(dateStr)) return;
    if (selectedSet.has(dateStr)) {
      props.onChange(props.value.filter((d) => d !== dateStr));
    } else {
      props.onChange([...props.value, dateStr].sort());
    }
  }

  function onRemoveDate(dateStr: string) {
    if (lockedSet.has(dateStr)) return;
    props.onChange(props.value.filter((d) => d !== dateStr));
  }

  return (
    <div className="flex flex-col gap-3">
      <DayPicker
        modifiers={{ selected: selectedDates }}
        onDayClick={onDayClick}
        disabled={{ before: props.minDate }}
        defaultMonth={props.minDate}
        locale={zhTW}
        classNames={{
          root: cn(
            "typo-body bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/50"
          ),
          months: "flex flex-col",
          month: "flex flex-col gap-4",
          nav: "flex items-center justify-between",
          button_previous: cn(
            "flex items-center justify-center size-8 rounded-md",
            "text-primary hover:bg-brand-50 transition-colors"
          ),
          button_next: cn(
            "flex items-center justify-center size-8 rounded-md",
            "text-primary hover:bg-brand-50 transition-colors"
          ),
          month_caption: "flex items-center justify-center",
          caption_label: "typo-ui text-sm font-medium select-none",
          weekdays: "flex",
          weekday:
            "flex-1 text-[0.8rem] font-normal text-secondary select-none text-center py-1",
          week: "mt-1 flex w-full gap-1",
          day: "flex-1 flex items-center justify-center rounded-md text-primary text-sm select-none transition-colors hover:bg-brand-50 cursor-pointer py-2",
          selected:
            "bg-brand-100 text-brand-600 hover:bg-brand-200 font-medium",
          disabled:
            "text-disabled opacity-50 cursor-default hover:bg-transparent",
          today: "font-bold text-accent",
          outside: "text-secondary opacity-50",
          chevron: "text-secondary size-4",
        }}
      />

      {props.value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(props.value))
            .sort()
            .map((dateStr) => {
              const isLocked = lockedSet.has(dateStr);
              return (
                <span
                  key={dateStr}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 typo-ui text-xs border",
                    isLocked
                      ? "bg-neutral-100 text-secondary border-neutral-200"
                      : "bg-brand-50 text-accent border-brand-200/60"
                  )}
                >
                  {dateStr}
                  {isLocked ? (
                    <span
                      className="text-[10px] text-secondary"
                      title="有報名者選擇此日期，無法移除"
                    >
                      🔒
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRemoveDate(dateStr)}
                      className="flex size-4 items-center justify-center rounded-full hover:bg-brand-100 transition-colors"
                    >
                      <IconX className="size-3" />
                    </button>
                  )}
                </span>
              );
            })}
        </div>
      )}

      {props.error != null && (
        <p className="typo-ui text-xs text-critical">{props.error}</p>
      )}
    </div>
  );
};

AvailableDatesPicker.displayName = "AvailableDatesPicker";

// ---------------------------------------------------------------------------
// PickupLocationsInput — tag-style multi-entry for pickup locations
// ---------------------------------------------------------------------------

interface PickupLocationsInputProps {
  value: string[];
  onChange: (locations: string[]) => void;
}

const PickupLocationsInput = (props: PickupLocationsInputProps) => {
  const [inputValue, setInputValue] = useState("");

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed === "" || props.value.includes(trimmed)) return;
    props.onChange([...props.value, trimmed]);
    setInputValue("");
  }

  function onRemove(index: number) {
    props.onChange(props.value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="輸入地點名稱後按 Enter 新增"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {props.value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {props.value.map((loc, index) => (
            <span
              key={loc}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 typo-ui text-xs border",
                "bg-brand-50 text-accent border-brand-200/60"
              )}
            >
              {loc}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex size-4 items-center justify-center rounded-full hover:bg-brand-100 transition-colors"
              >
                <IconX className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

PickupLocationsInput.displayName = "PickupLocationsInput";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STATUS_OPTIONS = [
  { value: "open", label: "開放報名" },
  { value: "closed", label: "已關閉" },
];
