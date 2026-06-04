"use client";

import {
  Pencil as IconPencil,
  Plus as IconPlus,
  Trash2 as IconTrash2,
} from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Input from "@/components/ui/atoms/Input";
import AdminSidebar from "@/components/ui/organisms/AdminSidebar";
import { eventTypesApi } from "@/lib/api/event-types.api";
import type { EventTypeRow } from "@/lib/types/database";
import { toSlug } from "@/lib/utils/slug";

interface EditingState {
  id: string | null;
  name_zh: string;
  name_en: string;
}

const EMPTY_FORM: EditingState = { id: null, name_zh: "", name_en: "" };

const TABLE_GRID =
  "grid grid-cols-[1.6fr_2fr_1.2fr_auto] items-center gap-4 px-5";

interface AdminEventTypesProps {}

const AdminEventTypes: React.FC<AdminEventTypesProps> = (props) => {
  void props;

  const { data: eventTypes = [], isLoading } = eventTypesApi.useAll();
  const createMutation = eventTypesApi.useCreate();
  const updateMutation = eventTypesApi.useUpdate();
  const deleteMutation = eventTypesApi.useDelete();

  const [editing, setEditing] = useState<EditingState | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  function checkDuplicate(nameEn: string, excludeId: string | null): boolean {
    const slug = toSlug(nameEn);
    const existing = eventTypes.find(
      (t) => t.slug === slug && t.id !== excludeId
    );
    if (existing) {
      setDuplicateError(`英文名稱「${nameEn}」與「${existing.name_en}」重複`);
      return true;
    }
    setDuplicateError(null);
    return false;
  }

  function onStartCreate() {
    setEditing({ ...EMPTY_FORM });
    setDuplicateError(null);
  }

  function onStartEdit(row: EventTypeRow) {
    setEditing({ id: row.id, name_zh: row.name_zh, name_en: row.name_en });
    setDuplicateError(null);
  }

  function onCancelEdit() {
    setEditing(null);
    setDuplicateError(null);
  }

  function onDelete(id: string) {
    if (!confirm("確定刪除此活動類型？")) return;
    deleteMutation.mutate(id);
  }

  function onSave() {
    if (!editing) return;
    if (!editing.name_zh.trim() || !editing.name_en.trim()) return;
    if (checkDuplicate(editing.name_en, editing.id)) return;

    const slug = toSlug(editing.name_en);

    if (editing.id != null) {
      updateMutation.mutate(
        {
          id: editing.id,
          slug,
          name_zh: editing.name_zh,
          name_en: editing.name_en,
        },
        {
          onSuccess: () => {
            setEditing(null);
            setDuplicateError(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        { slug, name_zh: editing.name_zh, name_en: editing.name_en },
        {
          onSuccess: () => {
            setEditing(null);
            setDuplicateError(null);
          },
        }
      );
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-1 flex-col overflow-clip bg-background">
        <div className="border-b border-stroke-default bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-primary">活動類型管理</h1>
        </div>

        <div className="flex items-center gap-3 border-b border-stroke-default bg-white px-6 py-3">
          <Button
            theme="solid"
            icon={<IconPlus className="size-4" />}
            onClick={onStartCreate}
            disabled={editing != null}
          >
            新增類型
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {editing != null && editing.id == null && (
            <div className="border-b border-stroke-default bg-surface px-6 py-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    label="中文名稱"
                    placeholder="野營私廚"
                    value={editing.name_zh}
                    onChange={(e) =>
                      setEditing({ ...editing, name_zh: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="英文名稱"
                    placeholder="Wild Camping Chef"
                    value={editing.name_en}
                    onChange={(e) => {
                      setEditing({ ...editing, name_en: e.target.value });
                      if (duplicateError != null) setDuplicateError(null);
                    }}
                    error={duplicateError ?? undefined}
                  />
                </div>
                <div className="flex shrink-0 gap-2 pb-0.5">
                  <Button theme="text" onClick={onCancelEdit}>
                    取消
                  </Button>
                  <Button theme="solid" onClick={onSave} disabled={isSaving}>
                    新增
                  </Button>
                </div>
              </div>
              {editing.name_en.trim() !== "" && (
                <p className="mt-1.5 text-xs text-secondary">
                  自動產生 slug：
                  <span className="text-primary">
                    {toSlug(editing.name_en)}
                  </span>
                </p>
              )}
            </div>
          )}

          <div
            className={`${TABLE_GRID} sticky top-0 z-[1] border-b border-stroke-default bg-white py-2.5 typo-overline text-[11px] text-secondary`}
          >
            <span>中文名稱</span>
            <span>英文名稱</span>
            <span>Slug（自動）</span>
            <span>操作</span>
          </div>

          {isLoading && (
            <p className="mt-12 text-center text-sm text-secondary">載入中…</p>
          )}

          {!isLoading && eventTypes.length === 0 && (
            <p className="mt-12 text-center text-sm text-secondary">
              尚無活動類型
            </p>
          )}

          {eventTypes.map((row) => {
            const isEditingThis = editing?.id === row.id;

            if (isEditingThis && editing != null) {
              return (
                <div
                  key={row.id}
                  className={`${TABLE_GRID} border-b border-stroke-default bg-surface py-2.5`}
                >
                  <Input
                    value={editing.name_zh}
                    onChange={(e) =>
                      setEditing({ ...editing, name_zh: e.target.value })
                    }
                  />
                  <div>
                    <Input
                      value={editing.name_en}
                      onChange={(e) => {
                        setEditing({ ...editing, name_en: e.target.value });
                        if (duplicateError != null) setDuplicateError(null);
                      }}
                      error={duplicateError ?? undefined}
                    />
                    {editing.name_en.trim() !== "" && (
                      <p className="mt-1 text-xs text-secondary">
                        slug：{toSlug(editing.name_en)}
                      </p>
                    )}
                  </div>
                  <span className="typo-body text-xs text-secondary">
                    {toSlug(editing.name_en)}
                  </span>
                  <div className="flex gap-2">
                    <Button theme="text" onClick={onCancelEdit}>
                      取消
                    </Button>
                    <Button theme="solid" onClick={onSave} disabled={isSaving}>
                      儲存
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={row.id}
                className={`${TABLE_GRID} border-b border-stroke-default py-3 text-sm hover:bg-surface`}
              >
                <span className="typo-ui truncate text-primary">
                  {row.name_zh}
                </span>
                <span className="typo-body truncate text-secondary">
                  {row.name_en}
                </span>
                <span className="typo-body truncate text-xs text-disabled">
                  {row.slug}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onStartEdit(row)}
                    disabled={editing != null}
                    className="rounded p-1.5 text-secondary transition-colors hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="編輯"
                  >
                    <IconPencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(row.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded p-1.5 text-secondary transition-colors hover:bg-red-50 hover:text-critical disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="刪除"
                  >
                    <IconTrash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

AdminEventTypes.displayName = "AdminEventTypes";
export default AdminEventTypes;
