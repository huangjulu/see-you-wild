"use client";

import React, { useState } from "react";

import Overlay from "@/components/ui/atoms/Overlay";
import TextArea from "@/components/ui/atoms/TextArea";
import Dialog from "@/components/ui/molecules/Dialog";
import { adminApi } from "@/lib/api/admin.api";
import type { EventListDto } from "@/lib/types/database";

interface DeleteEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: EventListDto | null;
}

const DeleteEventDialog: React.FC<DeleteEventDialogProps> = (props) => {
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
          setReason("");
          setError(null);
          props.onClose();
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
