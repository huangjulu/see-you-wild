"use client";

import Overlay from "@/components/ui/atoms/Overlay";
import Dialog from "@/components/ui/molecules/Dialog";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";

interface PaymentReviewDialogProps {
  open: boolean;
  onClose: () => void;
  registration: {
    id: string;
    name: string;
    payment_ref: string | null;
    amount_due: number;
    eventTitle: string;
  } | null;
}

const PaymentReviewDialog = (props: PaymentReviewDialogProps) => {
  const { toast } = useToast();
  const { mutate, isPending } = adminApi.registrations.useConfirmPayment();

  function onConfirm() {
    if (props.registration == null) return;
    mutate(props.registration.id, {
      onSuccess: () => {
        toast.success("已確認收款");
        props.onClose();
      },
      onError: (err) => {
        toast.error("操作失敗", { description: err.message });
      },
    });
  }

  const reg = props.registration;

  return (
    <Overlay open={props.open} onBackdropClick={props.onClose}>
      <Dialog title="確認收款" className="max-w-sm w-full mx-4">
        {reg != null && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="typo-overline text-xs text-secondary">姓名</span>
              <span className="typo-body text-sm text-primary">{reg.name}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="typo-overline text-xs text-secondary">活動</span>
              <span className="typo-body text-sm text-primary">
                {reg.eventTitle}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="typo-overline text-xs text-secondary">
                末五碼
              </span>
              <span className="typo-body font-bold text-primary">
                {reg.payment_ref ?? "—"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="typo-overline text-xs text-secondary">金額</span>
              <span className="typo-ui text-sm text-accent">
                NT$ {reg.amount_due.toLocaleString("zh-TW")}
              </span>
            </div>
          </div>
        )}
        {isPending && <Dialog.Loader />}
        <Dialog.OutlineButton onClick={props.onClose} disabled={isPending}>
          取消
        </Dialog.OutlineButton>
        <Dialog.PrimaryButton onClick={onConfirm} disabled={isPending}>
          確認收款
        </Dialog.PrimaryButton>
      </Dialog>
    </Overlay>
  );
};

PaymentReviewDialog.displayName = "PaymentReviewDialog";
export default PaymentReviewDialog;
