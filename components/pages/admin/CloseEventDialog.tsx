"use client";

import ConfirmReasonDialog from "@/components/ui/molecules/ConfirmReasonDialog";
import { adminApi } from "@/lib/api/admin.api";
import { useToast } from "@/lib/hooks/useToast";
import type { EventListDto } from "@/lib/types/database";

interface CloseEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  event: EventListDto | null;
}

const CloseEventDialog: React.FC<CloseEventDialogProps> = (props) => {
  const { toast } = useToast();
  const updateMutation = adminApi.events.useUpdate();
  const registrationCount = props.event?.registrations.length ?? 0;

  function handleConfirm(reason: string) {
    if (props.event == null) return;

    updateMutation.mutate(
      {
        eventId: props.event.id,
        data: { status: "closed" },
      },
      {
        onSuccess: () => {
          toast.success("活動已關閉，報名者將收到通知信");
          props.onConfirmed();
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
          ? `確定要關閉「${props.event.title}」嗎？`
          : "確定要關閉活動嗎？"
      }
      message={`關閉後將停止接受報名。該活動的 ${registrationCount} 位報名者將收到活動關閉的信件通知。`}
      reasonLabel="關閉原因"
      reasonPlaceholder="請輸入關閉原因，將寄送給已報名的參加者..."
      confirmLabel="確認關閉"
      confirmingLabel="關閉中..."
      isPending={updateMutation.isPending}
      variant="warning"
    />
  );
};

CloseEventDialog.displayName = "CloseEventDialog";
export default CloseEventDialog;
