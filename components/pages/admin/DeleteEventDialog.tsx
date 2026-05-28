"use client";

import ConfirmReasonDialog from "@/components/ui/molecules/ConfirmReasonDialog";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";
import type { EventListDto } from "@/lib/types/database";

interface DeleteEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: EventListDto | null;
}

const DeleteEventDialog: React.FC<DeleteEventDialogProps> = (props) => {
  const { toast } = useToast();
  const deleteMutation = adminApi.events.useDelete();
  const registrationCount = props.event?.registrations.length ?? 0;

  function handleConfirm(reason: string) {
    if (props.event == null) return;

    deleteMutation.mutate(
      { eventId: props.event.id, cancellationReason: reason },
      {
        onSuccess: () => {
          toast.success("活動已刪除");
          props.onClose();
        },
        onError: (err) => {
          toast.error("操作失敗", { description: err.message });
        },
      }
    );
  }

  return (
    <ConfirmReasonDialog
      open={props.open}
      onClose={props.onClose}
      onConfirm={handleConfirm}
      title={
        props.event != null
          ? `確定要刪除「${props.event.title}」嗎？`
          : "確定要刪除嗎？"
      }
      message={`此操作無法復原。該活動的 ${registrationCount} 位報名者將收到取消通知。`}
      reasonLabel="取消原因"
      reasonPlaceholder="請輸入取消原因，將寄送給已報名的參加者..."
      confirmLabel="確認刪除"
      confirmingLabel="刪除中..."
      isPending={deleteMutation.isPending}
      variant="danger"
    />
  );
};

DeleteEventDialog.displayName = "DeleteEventDialog";
export default DeleteEventDialog;
