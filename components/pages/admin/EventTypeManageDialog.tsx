"use client";

import {
  MoreVertical as IconMoreVertical,
  Plus as IconPlus,
} from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Input from "@/components/ui/atoms/Input";
import Overlay from "@/components/ui/atoms/Overlay";
import ModalCard from "@/components/ui/molecules/ModalCard";
import { eventTypesApi } from "@/lib/api/event-types.api";
import type { EventTypeRow } from "@/lib/types/database";

interface EventTypeManageDialogProps {
  open: boolean;
  onClose: () => void;
}

interface EditingState {
  id: string | null;
  slug: string;
  name_zh: string;
  name_en: string;
}

const EMPTY_FORM: EditingState = {
  id: null,
  slug: "",
  name_zh: "",
  name_en: "",
};

const EventTypeManageDialog = (props: EventTypeManageDialogProps) => {
  const { data: eventTypes = [] } = eventTypesApi.useAll();
  const createMutation = eventTypesApi.useCreate();
  const updateMutation = eventTypesApi.useUpdate();
  const deleteMutation = eventTypesApi.useDelete();

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  function onStartCreate() {
    setEditing({ ...EMPTY_FORM });
    setMenuOpenId(null);
  }

  function onStartEdit(row: EventTypeRow) {
    setEditing({
      id: row.id,
      slug: row.slug,
      name_zh: row.name_zh,
      name_en: row.name_en,
    });
    setMenuOpenId(null);
  }

  function onDelete(id: string) {
    if (!confirm("確定刪除此活動類型？")) return;
    deleteMutation.mutate(id);
    setMenuOpenId(null);
  }

  function onSave() {
    if (!editing) return;
    if (
      !editing.slug.trim() ||
      !editing.name_zh.trim() ||
      !editing.name_en.trim()
    )
      return;

    if (editing.id != null) {
      updateMutation.mutate(
        {
          id: editing.id,
          slug: editing.slug,
          name_zh: editing.name_zh,
          name_en: editing.name_en,
        },
        { onSuccess: () => setEditing(null) }
      );
    } else {
      createMutation.mutate(
        {
          slug: editing.slug,
          name_zh: editing.name_zh,
          name_en: editing.name_en,
        },
        { onSuccess: () => setEditing(null) }
      );
    }
  }

  return (
    <Overlay
      open={props.open}
      onBackdropClick={props.onClose}
      className="z-110"
    >
      <div className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <ModalCard className="max-h-[80dvh]">
          <ModalCard.Header title="管理活動類型">
            <ModalCard.Header.CloseButton onClick={props.onClose} />
          </ModalCard.Header>

          <ModalCard.Main className="space-y-4">
            <Button
              theme="outline"
              onClick={onStartCreate}
              icon={<IconPlus className="size-4" />}
            >
              新增類型
            </Button>

            {editing != null && (
              <div className="rounded-lg border border-stroke-default p-3 space-y-2">
                <p className="typo-ui text-sm text-secondary">
                  {editing.id != null ? "編輯類型" : "新增類型"}
                </p>
                <Input
                  label="Slug（英文代碼）"
                  placeholder="例：camping"
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                />
                <Input
                  label="中文名稱"
                  placeholder="例：野營私廚"
                  value={editing.name_zh}
                  onChange={(e) =>
                    setEditing({ ...editing, name_zh: e.target.value })
                  }
                />
                <Input
                  label="英文名稱"
                  placeholder="例：Wild Camping Chef"
                  value={editing.name_en}
                  onChange={(e) =>
                    setEditing({ ...editing, name_en: e.target.value })
                  }
                />
                <div className="flex gap-2 justify-end">
                  <Button theme="text" onClick={() => setEditing(null)}>
                    取消
                  </Button>
                  <Button
                    theme="solid"
                    onClick={onSave}
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {editing.id != null ? "儲存" : "新增"}
                  </Button>
                </div>
              </div>
            )}

            <div className="divide-y divide-stroke-default">
              {eventTypes.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="typo-ui text-sm text-primary truncate">
                      {row.name_zh}
                    </p>
                    <p className="typo-body-2 text-xs text-secondary truncate">
                      {row.name_en} · {row.slug}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpenId(menuOpenId === row.id ? null : row.id)
                      }
                      className="p-1 rounded hover:bg-neutral-100"
                    >
                      <IconMoreVertical className="size-4 text-secondary" />
                    </button>
                    {menuOpenId === row.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-stroke-default rounded-md shadow-md z-10 min-w-24">
                        <button
                          type="button"
                          className="block w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50"
                          onClick={() => onStartEdit(row)}
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="block w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                          onClick={() => onDelete(row.id)}
                        >
                          刪除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ModalCard.Main>

          <ModalCard.Footer>
            <div className="flex flex-1 justify-end">
              <Button theme="outline" onClick={props.onClose}>
                關閉
              </Button>
            </div>
          </ModalCard.Footer>
        </ModalCard>
      </div>
    </Overlay>
  );
};

EventTypeManageDialog.displayName = "EventTypeManageDialog";
export default EventTypeManageDialog;
