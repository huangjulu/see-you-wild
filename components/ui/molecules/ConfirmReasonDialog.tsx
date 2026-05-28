"use client";

import { useState } from "react";

import Overlay from "@/components/ui/atoms/Overlay";
import TextArea from "@/components/ui/atoms/TextArea";
import Dialog from "@/components/ui/molecules/Dialog";

interface ConfirmReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  message: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel: string;
  confirmingLabel?: string;
  isPending?: boolean;
  variant?: "danger" | "warning";
}

const ConfirmReasonDialog: React.FC<ConfirmReasonDialogProps> = (props) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    if (reason.trim() === "") {
      setError("請輸入原因");
      return;
    }
    props.onConfirm(reason.trim());
  }

  function handleClose() {
    setReason("");
    setError(null);
    props.onClose();
  }

  const ConfirmButton =
    props.variant === "warning" ? Dialog.PrimaryButton : Dialog.DangerButton;

  return (
    <Overlay open={props.open} onBackdropClick={handleClose}>
      <Dialog
        title={props.title}
        message={props.message}
        className="w-full max-w-md"
      >
        <div className="mt-3">
          <TextArea
            label={props.reasonLabel ?? "原因"}
            placeholder={props.reasonPlaceholder ?? "請輸入原因..."}
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
        <ConfirmButton onClick={handleConfirm} disabled={props.isPending}>
          {props.isPending
            ? (props.confirmingLabel ?? "處理中...")
            : props.confirmLabel}
        </ConfirmButton>
      </Dialog>
    </Overlay>
  );
};

ConfirmReasonDialog.displayName = "ConfirmReasonDialog";
export default ConfirmReasonDialog;
