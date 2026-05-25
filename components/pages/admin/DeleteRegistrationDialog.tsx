"use client";

import Overlay from "@/components/ui/atoms/Overlay";
import Dialog from "@/components/ui/molecules/Dialog";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";
import type { RegistrationAdminDto } from "@/lib/types/database";

interface DeleteRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  registration: (RegistrationAdminDto & { eventTitle: string }) | null;
}

const DeleteRegistrationDialog = (props: DeleteRegistrationDialogProps) => {
  const { toast } = useToast();
  const deleteMutation = adminApi.registrations.useDelete();

  function handleConfirmDelete() {
    if (props.registration == null) return;

    deleteMutation.mutate(props.registration.id, {
      onSuccess: () => {
        toast.success("報名已刪除");
        props.onClose();
      },
      onError: (err) => {
        toast.error("操作失敗", { description: err.message });
      },
    });
  }

  return (
    <Overlay open={props.open} onBackdropClick={props.onClose}>
      <Dialog
        title={
          props.registration != null
            ? `確定要刪除「${props.registration.name}」的報名嗎？`
            : "確定要刪除嗎？"
        }
        message="此操作無法復原。"
        className="w-full max-w-md"
      >
        <Dialog.OutlineButton onClick={props.onClose}>
          取消
        </Dialog.OutlineButton>
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

DeleteRegistrationDialog.displayName = "DeleteRegistrationDialog";
export default DeleteRegistrationDialog;
