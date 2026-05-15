"use client";

import { useState } from "react";

import Overlay from "@/components/ui/atoms/Overlay";
import TextArea from "@/components/ui/atoms/TextArea";
import Dialog from "@/components/ui/molecules/Dialog";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";
import type { EventListDto } from "@/lib/types/database";

interface DeleteEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: EventListDto | null;
}

const DeleteEventDialog = (props: DeleteEventDialogProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const deleteMutation = adminApi.events.useDelete();

  const registrationCount = props.event?.registrations.length ?? 0;

  function handleConfirmDelete() {
    if (reason.trim() === "") {
      setError("請輸入取消原因");
      return;
    }

    if (props.event == null) return;

    deleteMutation.mutate(
      { eventId: props.event.id, cancellationReason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("活動已刪除");
          setReason("");
          setError(null);
          props.onClose();
        },
        onError: (err) => {
          toast.error("操作失敗", { description: err.message });
        },
      }
    );
  }

  function handleClose() {
    setReason("");
    setError(null);
    props.onClose();
  }

  return (
    <Overlay open={props.open} onBackdropClick={handleClose}>
      <Dialog
        title={
          props.event != null
            ? `確定要刪除「${props.event.title}」嗎？`
            : "確定要刪除嗎？"
        }
        message={`此操作無法復原。該活動的 ${registrationCount} 位報名者將收到取消通知。`}
        className="w-full max-w-md"
      >
        <div className="mt-3">
          <TextArea
            label="取消原因"
            placeholder="請輸入取消原因，將寄送給已報名的參加者..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error != null) setError(null);
            }}
            error={error ?? undefined}
            required
          />
        </div>
        <Dialog.OutlineButton onClick={handleClose}>取消</Dialog.OutlineButton>
        <Dialog.DangerButton
          onClick={handleConfirmDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "刪除中..." : "確認刪除"}
        </Dialog.DangerButton>
      </Dialog>
    </Overlay>
  );
};

DeleteEventDialog.displayName = "DeleteEventDialog";
export default DeleteEventDialog;
