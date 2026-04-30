"use client";

import { ChevronDown as IconChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Variant Payloads ───────────────────────────────────────────────────────

const VARIANTS: Record<string, string> = {
  "reg-self": `{
  "event_id": "camping-chef-alishan-202605",
  "name": "王小明",
  "email": "ming@example.com",
  "phone": "0912345678",
  "gender": "male",
  "id_number": "A123456789",
  "birthday": "1995-06-15",
  "emergency_contact_name": "王大明",
  "emergency_contact_phone": "0987654321",
  "dietary": "omnivore",
  "wants_rental": true,
  "transport": "self"
}`,
  "reg-passenger": `{
  "event_id": "camping-chef-alishan-202605",
  "name": "李小華",
  "email": "hua@example.com",
  "phone": "0922334455",
  "gender": "female",
  "id_number": "B234567890",
  "birthday": "1998-03-22",
  "emergency_contact_name": "李大華",
  "emergency_contact_phone": "0911223344",
  "dietary": "no_beef",
  "transport": "carpool",
  "pickup_location": "台北車站",
  "carpool_role": "passenger"
}`,
  "reg-driver": `{
  "event_id": "camping-chef-alishan-202605",
  "name": "張大強",
  "email": "strong@example.com",
  "phone": "0933445566",
  "gender": "male",
  "id_number": "C345678901",
  "birthday": "1992-11-08",
  "emergency_contact_name": "張小強",
  "emergency_contact_phone": "0955667788",
  "dietary": "omnivore",
  "transport": "carpool",
  "pickup_location": "台北車站",
  "carpool_role": "driver",
  "seat_count": 4
}`,
  "patch-paid": `{
  "status": "paid"
}`,
  "patch-edit": `{
  "name": "王小明（已改名）",
  "dietary": "no_beef"
}`,
};

// ─── Types ──────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiStatus {
  code: number;
  text: string;
  ok: boolean;
}

interface EndpointCardProps {
  method: HttpMethod;
  path: string;
  desc: string;
  dtoTag: string;
  defaultBody?: string;
  paramName?: string;
  paramLabel?: string;
  paramDefault?: string;
  paramPlaceholder?: string;
  isAuth?: boolean;
  authDefault?: string;
  variants?: { key: string; label: string }[];
  variantBodyId?: string;
}

interface DtoRow {
  field: string;
  type: string;
  desc: string;
  isGroup?: boolean;
}

interface DtoCardProps {
  title: string;
  subtitle: string;
  rows?: DtoRow[];
  tabs?: { id: string; label: string; usage: string; rows: DtoRow[] }[];
}

// ─── Endpoint Data ──────────────────────────────────────────────────────────

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-green-100 text-green-800",
  POST: "bg-blue-100 text-blue-800",
  PATCH: "bg-orange-100 text-orange-800",
  DELETE: "bg-red-100 text-red-800",
};

const SECTIONS: { title: string; endpoints: EndpointCardProps[] }[] = [
  {
    title: "Events",
    endpoints: [
      {
        method: "GET",
        path: "/api/events",
        desc: "活動列表 + 報名摘要",
        dtoTag: "EventListDto[]",
      },
      {
        method: "POST",
        path: "/api/events",
        desc: "建立活動",
        dtoTag: "EventCreateDto",
        defaultBody: `{
  "id": "camping-chef-alishan-202605",
  "type": "camping",
  "location": "阿里山",
  "title": "野營私廚｜阿里山秘境",
  "start_date": "2026-05-18",
  "end_date": "2026-05-19",
  "base_price": 4800,
  "carpool_surcharge": 450,
  "payment_days": 7
}`,
      },
    ],
  },
  {
    title: "Registrations",
    endpoints: [
      {
        method: "POST",
        path: "/api/registrations",
        desc: "客戶報名",
        dtoTag: "RegistrationCreateDto",
        variants: [
          { key: "reg-self", label: "自行前往" },
          { key: "reg-passenger", label: "共乘乘客" },
          { key: "reg-driver", label: "共乘車手" },
        ],
        variantBodyId: "reg-self",
      },
      {
        method: "GET",
        path: "/api/events/{eventId}/registrations",
        desc: "某場活動的報名列表",
        dtoTag: "RegistrationSummaryDto[]",
        paramName: "eventId",
        paramLabel: "eventId",
        paramDefault: "camping-chef-alishan-202605",
      },
      {
        method: "GET",
        path: "/api/registrations/{id}",
        desc: "單筆報名詳情",
        dtoTag: "RegistrationDetailDto",
        paramName: "id",
        paramLabel: "id (uuid)",
        paramPlaceholder: "從報名回傳結果複製 id 貼這裡",
      },
      {
        method: "PATCH",
        path: "/api/registrations/{id}",
        desc: "修改報名 / 確認付款",
        dtoTag: "RegistrationUpdateDto",
        paramName: "id",
        paramLabel: "id (uuid)",
        paramPlaceholder: "從報名回傳結果複製 id 貼這裡",
        variants: [
          { key: "patch-paid", label: "確認付款" },
          { key: "patch-edit", label: "修改資料" },
        ],
        variantBodyId: "patch-paid",
      },
      {
        method: "PATCH",
        path: "/api/registrations/{id}/payment-ref",
        desc: "客戶填帳號末五碼",
        dtoTag: "RegistrationPaymentRefDto",
        paramName: "id",
        paramLabel: "id (uuid)",
        paramPlaceholder: "從報名回傳結果複製 id 貼這裡",
        defaultBody: `{
  "payment_ref": "12345",
  "token": "PASTE_TOKEN_HERE"
}`,
      },
      {
        method: "DELETE",
        path: "/api/registrations/{id}",
        desc: "刪除報名",
        dtoTag: "void",
        paramName: "id",
        paramLabel: "id (uuid)",
        paramPlaceholder: "從報名回傳結果複製 id 貼這裡",
      },
    ],
  },
  {
    title: "Carpool",
    endpoints: [
      {
        method: "POST",
        path: "/api/events/{eventId}/carpool-assignments",
        desc: "觸發配車演算法",
        dtoTag: "CarpoolAssignmentDetailDto[]",
        paramName: "eventId",
        paramLabel: "eventId",
        paramDefault: "camping-chef-alishan-202605",
      },
      {
        method: "GET",
        path: "/api/events/{eventId}/carpool-assignments",
        desc: "查看配車結果",
        dtoTag: "CarpoolAssignmentDetailDto[]",
        paramName: "eventId",
        paramLabel: "eventId",
        paramDefault: "camping-chef-alishan-202605",
      },
    ],
  },
  {
    title: "Cron",
    endpoints: [
      {
        method: "POST",
        path: "/api/cron/cleanup-expired",
        desc: "清除過期未繳報名",
        dtoTag: "void",
        isAuth: true,
        paramLabel: "Authorization Bearer Token",
        authDefault: "see-you-wild-cron-secret-key-2026",
      },
    ],
  },
];

// ─── DTO Reference Data ─────────────────────────────────────────────────────

const DTO_CARDS: DtoCardProps[] = [
  {
    title: "Event",
    subtitle: "EventCreateDto · EventListDto",
    rows: [
      {
        field: "id",
        type: "string PK",
        desc: "人類可讀 ID e.g. camping-chef-alishan-202605",
      },
      { field: "type", type: "string", desc: "活動種類 e.g. 野溪溫泉 登山" },
      { field: "location", type: "string", desc: "活動地點 e.g. 宜蘭 新北" },
      {
        field: "title",
        type: "string",
        desc: "活動標題 e.g. 宜蘭秘境野溪溫泉",
      },
      {
        field: "start_date",
        type: "string (date)",
        desc: "活動起始日，單日活動 = end_date",
      },
      { field: "end_date", type: "string (date)", desc: "活動結束日" },
      {
        field: "base_price",
        type: "number",
        desc: "基本費用（自行前往） e.g. 2980",
      },
      { field: "carpool_surcharge", type: "number", desc: "共乘加價 e.g. 300" },
      { field: "payment_days", type: "number", desc: "繳費寬限天數" },
      {
        field: "min_participants",
        type: "number",
        desc: "最低開團人數，預設 3",
      },
      { field: "status", type: "enum", desc: "open 開放報名 · closed 已截止" },
      {
        field: "first_created_at",
        type: "string (timestamptz)",
        desc: "活動首次建立時間（EventListDto only）",
      },
      { field: "EventListDto 額外欄位", type: "", desc: "", isGroup: true },
      {
        field: "registrations",
        type: "RegistrationSummaryDto[]",
        desc: "該活動下所有報名摘要",
      },
    ],
  },
  {
    title: "Registration",
    subtitle: "CreateDto · DetailDto · UpdateDto · SummaryDto · PaymentRefDto",
    tabs: [
      {
        id: "dto-reg-detail",
        label: "DetailDto",
        usage:
          "RegistrationDetailDto — GET /api/registrations/{id} response\nRegistrationUpdateDto — PATCH /api/registrations/{id} request（所有欄位 optional）",
        rows: [
          { field: "id", type: "string (uuid) PK", desc: "自動產生" },
          { field: "event_id", type: "string FK", desc: "對應 events.id" },
          { field: "個資", type: "", desc: "", isGroup: true },
          { field: "name", type: "string", desc: "真實姓名" },
          { field: "email", type: "string", desc: "用於寄送繳費通知信" },
          { field: "phone", type: "string", desc: "聯絡手機" },
          { field: "line_id", type: "string | null", desc: "LINE ID，選填" },
          {
            field: "gender",
            type: "enum",
            desc: "male 男 · female 女 · other 其他",
          },
          {
            field: "id_number",
            type: "string",
            desc: "身分證/護照號碼（保險用）",
          },
          {
            field: "birthday",
            type: "string (date)",
            desc: "出生日期（保險用）",
          },
          {
            field: "emergency_contact_name",
            type: "string",
            desc: "緊急聯絡人姓名",
          },
          {
            field: "emergency_contact_phone",
            type: "string",
            desc: "緊急聯絡人電話",
          },
          { field: "活動相關", type: "", desc: "", isGroup: true },
          {
            field: "dietary",
            type: "enum",
            desc: "omnivore 葷食 · no_beef 不吃牛 · vegetarian 方便素 · vegan 全素",
          },
          { field: "wants_rental", type: "boolean", desc: "是否需要租借裝備" },
          { field: "notes", type: "string | null", desc: "備註，選填" },
          { field: "交通與共乘", type: "", desc: "", isGroup: true },
          {
            field: "transport",
            type: "enum",
            desc: "self 自行前往 · carpool 共乘方案",
          },
          {
            field: "pickup_location",
            type: "string | null",
            desc: "taipei nangang dapinglin sanchong banqiao。self = null",
          },
          {
            field: "carpool_role",
            type: "enum | null",
            desc: "passenger 被載者 · driver 車手。self = null",
          },
          {
            field: "seat_count",
            type: "number | null",
            desc: "車手可載人數（不含駕駛），3-5。非車手 = null",
          },
          { field: "金流與狀態", type: "", desc: "", isGroup: true },
          {
            field: "amount_due",
            type: "number",
            desc: "self = base_price · carpool = base_price + surcharge",
          },
          {
            field: "payment_ref",
            type: "string | null",
            desc: "匯款帳號末五碼，報名時 = null",
          },
          {
            field: "status",
            type: "enum",
            desc: "pending 待繳費 · paid 已確認收款",
          },
          {
            field: "created_at",
            type: "string (timestamptz)",
            desc: "報名時間",
          },
          {
            field: "confirmed_at",
            type: "string (timestamptz) | null",
            desc: "確認收款時間（非實際匯款時間）",
          },
          {
            field: "expires_at",
            type: "string (timestamptz)",
            desc: "繳費期限，逾期由 cron 刪除",
          },
        ],
      },
      {
        id: "dto-reg-create",
        label: "CreateDto",
        usage:
          "RegistrationCreateDto — POST /api/registrations request body\n不含 id / amount_due / payment_ref / status / created_at / confirmed_at / expires_at（系統自動計算）",
        rows: [
          { field: "event_id", type: "string", desc: "對應 events.id" },
          { field: "name", type: "string", desc: "真實姓名" },
          { field: "email", type: "string", desc: "email" },
          { field: "phone", type: "string", desc: "聯絡手機" },
          { field: "line_id", type: "string | null", desc: "LINE ID，選填" },
          { field: "gender", type: "enum", desc: "male · female · other" },
          { field: "id_number", type: "string", desc: "身分證/護照號碼" },
          { field: "birthday", type: "string (date)", desc: "出生日期" },
          {
            field: "emergency_contact_name",
            type: "string",
            desc: "緊急聯絡人姓名",
          },
          {
            field: "emergency_contact_phone",
            type: "string",
            desc: "緊急聯絡人電話",
          },
          {
            field: "dietary",
            type: "enum",
            desc: "omnivore · no_beef · vegetarian · vegan",
          },
          { field: "wants_rental", type: "boolean", desc: "是否需要租借裝備" },
          { field: "notes", type: "string | null", desc: "備註，選填" },
          { field: "transport", type: "enum", desc: "self · carpool" },
          {
            field: "pickup_location",
            type: "string | null",
            desc: "共乘上車地點。self = null",
          },
          {
            field: "carpool_role",
            type: "enum | null",
            desc: "passenger · driver。self = null",
          },
          {
            field: "seat_count",
            type: "number | null",
            desc: "車手座位數 3-5。非車手 = null",
          },
        ],
      },
      {
        id: "dto-reg-summary",
        label: "SummaryDto",
        usage:
          "RegistrationSummaryDto — GET /api/events/{eventId}/registrations response · GET /api/events 巢狀欄位\n不含敏感資料",
        rows: [
          { field: "id", type: "string (uuid)", desc: "報名 ID" },
          { field: "name", type: "string", desc: "報名者姓名" },
          { field: "status", type: "enum", desc: "pending · paid" },
          { field: "transport", type: "enum", desc: "self · carpool" },
          {
            field: "payment_ref",
            type: "string | null",
            desc: "匯款末五碼，未回填 = null",
          },
          {
            field: "created_at",
            type: "string (timestamptz)",
            desc: "報名時間",
          },
        ],
      },
      {
        id: "dto-reg-payref",
        label: "PaymentRefDto",
        usage:
          "RegistrationPaymentRefDto — PATCH /api/registrations/{id}/payment-ref request body",
        rows: [
          {
            field: "payment_ref",
            type: "string",
            desc: "匯款帳號末五碼，5 位數字",
          },
          {
            field: "token",
            type: "string",
            desc: "HMAC 驗證 token（從通知信連結取得）",
          },
        ],
      },
    ],
  },
  {
    title: "CarpoolAssignment",
    subtitle: "CarpoolAssignmentDetailDto",
    rows: [
      { field: "id", type: "string (uuid) PK", desc: "自動產生" },
      {
        field: "event_id",
        type: "string FK",
        desc: "對應 events.id（冗餘，方便前端查詢）",
      },
      {
        field: "car_group",
        type: "number",
        desc: "車組編號 1, 2, 3... 同編號 = 同一台車",
      },
      {
        field: "pickup_location",
        type: "string",
        desc: "最終上車地點（合併時可能與原始偏好不同）",
      },
      {
        field: "registration_id",
        type: "string (uuid) FK",
        desc: "對應 registrations.id，一對一",
      },
      {
        field: "final_role",
        type: "enum",
        desc: "driver 最終車手 · passenger 最終乘客（含降級車手）",
      },
      {
        field: "refund_amount",
        type: "number",
        desc: "車手 = (seat_count+1) × surcharge · 乘客 = 0",
      },
      {
        field: "created_at",
        type: "string (timestamptz)",
        desc: "配車結果產生時間",
      },
    ],
  },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

interface VariantSelectorProps {
  variants: { key: string; label: string }[];
  activeKey: string;
  onSelect: (key: string) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = (props) => (
  <div className="mb-3 flex overflow-hidden rounded-md border border-border">
    {props.variants.map((v) => (
      <button
        key={v.key}
        onClick={() => props.onSelect(v.key)}
        className={cn(
          "flex-1 border-r border-border px-3 py-2 text-xs font-semibold transition-colors last:border-r-0",
          props.activeKey === v.key
            ? "bg-foreground text-background"
            : "bg-background text-muted hover:bg-surface"
        )}
      >
        {v.label}
      </button>
    ))}
  </div>
);

VariantSelector.displayName = "VariantSelector";

interface DtoTableProps {
  rows: DtoRow[];
}

const DtoTable: React.FC<DtoTableProps> = (props) => (
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr>
        <th className="border-b-2 border-border bg-background px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted">
          欄位
        </th>
        <th className="border-b-2 border-border bg-background px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted">
          型別
        </th>
        <th className="border-b-2 border-border bg-background px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted">
          說明
        </th>
      </tr>
    </thead>
    <tbody>
      {props.rows.map((row, i) => {
        if (row.isGroup) {
          return (
            <tr key={i}>
              <td
                colSpan={3}
                className="border-b border-border bg-surface px-3 py-2 text-xs font-bold text-accent"
              >
                {row.field}
              </td>
            </tr>
          );
        }
        return (
          <tr key={i}>
            <td className="border-b border-border px-3 py-1.5 font-mono font-semibold whitespace-nowrap align-top">
              {row.field}
            </td>
            <td className="border-b border-border px-3 py-1.5 font-mono text-muted whitespace-nowrap align-top">
              {row.type}
            </td>
            <td className="border-b border-border px-3 py-1.5 align-top text-foreground">
              {row.desc}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

DtoTable.displayName = "DtoTable";

interface DtoCardComponentProps {
  card: DtoCardProps;
}

const DtoCard: React.FC<DtoCardComponentProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    props.card.tabs ? props.card.tabs[0].id : ""
  );

  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-border bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface"
      >
        <span className="min-w-[56px] shrink-0 rounded px-2 py-0.5 text-center font-mono text-xs font-bold bg-foreground text-background">
          DTO
        </span>
        <span className="flex-1 font-mono text-sm">{props.card.title}</span>
        <span className="shrink-0 text-xs text-muted">
          {props.card.subtitle}
        </span>
        <IconChevronDown
          className={cn(
            "size-4 shrink-0 text-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border p-4">
          {props.card.tabs ? (
            <>
              <VariantSelector
                variants={props.card.tabs.map((t) => ({
                  key: t.id,
                  label: t.label,
                }))}
                activeKey={activeTab}
                onSelect={setActiveTab}
              />
              {props.card.tabs.map((tab) =>
                tab.id === activeTab ? (
                  <div key={tab.id}>
                    <p className="mb-3 whitespace-pre-line text-xs leading-relaxed text-muted">
                      {tab.usage}
                    </p>
                    <DtoTable rows={tab.rows} />
                  </div>
                ) : null
              )}
            </>
          ) : props.card.rows ? (
            <DtoTable rows={props.card.rows} />
          ) : null}
        </div>
      )}
    </div>
  );
};

DtoCard.displayName = "DtoCard";

interface EndpointCardComponentProps {
  endpoint: EndpointCardProps;
  openId: string | null;
  onToggle: (id: string) => void;
}

const EndpointCard: React.FC<EndpointCardComponentProps> = (props) => {
  const ep = props.endpoint;
  const cardId = `${ep.method}:${ep.path}`;
  const isOpen = props.openId === cardId;

  const [paramValue, setParamValue] = useState(ep.paramDefault ?? "");
  const [authValue, setAuthValue] = useState(ep.authDefault ?? "");
  const [bodyValue, setBodyValue] = useState(
    ep.variants
      ? (VARIANTS[ep.variantBodyId ?? ""] ?? "")
      : (ep.defaultBody ?? "")
  );
  const [activeVariant, setActiveVariant] = useState(ep.variantBodyId ?? "");
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  function handleVariantSelect(key: string) {
    setActiveVariant(key);
    setBodyValue(VARIANTS[key] ?? "");
  }

  async function handleRun() {
    let path = ep.path;

    if (ep.paramName) {
      const val = paramValue.trim();
      if (!val) {
        setStatus(null);
        setStatusMsg(`Missing: ${ep.paramName}`);
        setResponse("");
        return;
      }
      path = path.replace(`{${ep.paramName}}`, val);
    }

    const url = window.location.origin + path;
    const headers: Record<string, string> = {};

    if (ep.isAuth) {
      headers["Authorization"] = `Bearer ${authValue.trim()}`;
    }

    if (bodyValue && (ep.method === "POST" || ep.method === "PATCH")) {
      headers["Content-Type"] = "application/json";
    }

    const options: RequestInit = {
      method: ep.method,
      headers,
      ...(bodyValue && (ep.method === "POST" || ep.method === "PATCH")
        ? { body: bodyValue }
        : {}),
    };

    setLoading(true);
    setStatus(null);
    setStatusMsg("Loading...");
    setResponse("");

    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let formatted: string;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        formatted = text;
      }

      setStatus({ code: res.status, text: res.statusText, ok: res.ok });
      setStatusMsg(`${res.status} ${res.statusText}`);
      setResponse(formatted);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ code: 0, text: "Network error", ok: false });
      setStatusMsg("Network error");
      setResponse(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-border bg-white">
      <button
        onClick={() => props.onToggle(cardId)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface"
      >
        <span
          className={cn(
            "min-w-[56px] shrink-0 rounded px-2 py-0.5 text-center font-mono text-xs font-bold",
            METHOD_STYLES[ep.method]
          )}
        >
          {ep.method}
        </span>
        <span className="flex-1 font-mono text-sm">{ep.path}</span>
        <span className="shrink-0 text-xs text-muted">{ep.desc}</span>
        <span className="shrink-0 rounded bg-background px-2 py-0.5 font-mono text-[11px] text-muted">
          {ep.dtoTag}
        </span>
        <IconChevronDown
          className={cn(
            "size-4 shrink-0 text-muted transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border p-4">
          {/* Param input (non-auth) */}
          {ep.paramName && (
            <>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                {ep.paramLabel}
              </label>
              <input
                value={paramValue}
                onChange={(e) => setParamValue(e.target.value)}
                placeholder={ep.paramPlaceholder}
                className="mb-3 w-full rounded-md border border-border bg-background px-2.5 py-2 font-mono text-xs text-foreground"
              />
            </>
          )}

          {/* Auth token input */}
          {ep.isAuth && (
            <>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                {ep.paramLabel}
              </label>
              <input
                value={authValue}
                onChange={(e) => setAuthValue(e.target.value)}
                className="mb-3 w-full rounded-md border border-border bg-background px-2.5 py-2 font-mono text-xs text-foreground"
              />
            </>
          )}

          {/* Variant selector */}
          {ep.variants && ep.variants.length > 0 && (
            <VariantSelector
              variants={ep.variants}
              activeKey={activeVariant}
              onSelect={handleVariantSelect}
            />
          )}

          {/* Body textarea */}
          {(ep.variants || ep.defaultBody) && (
            <textarea
              value={bodyValue}
              onChange={(e) => setBodyValue(e.target.value)}
              className="mb-3 w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground"
              rows={10}
            />
          )}

          {/* Run row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={loading}
              className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? "Running..." : "Run"}
            </button>
            {statusMsg && (
              <span
                className={cn(
                  "font-mono text-xs",
                  status === null && "text-muted",
                  status?.ok === true && "text-success",
                  status?.ok === false && "text-error"
                )}
              >
                {statusMsg}
              </span>
            )}
          </div>

          {/* Response */}
          {response && (
            <div className="mt-3">
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-foreground p-4 font-mono text-xs leading-relaxed text-background">
                {response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

EndpointCard.displayName = "EndpointCard";

// ─── Page ───────────────────────────────────────────────────────────────────

const ApiPlaygroundPage: React.FC = () => {
  const [openEndpointId, setOpenEndpointId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(function initBaseUrl() {
    setBaseUrl(window.location.origin);
  }, []);

  function handleToggle(id: string) {
    setOpenEndpointId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">See You Wild API Playground</h1>
        <p className="mb-8 text-sm text-muted">
          {baseUrl} · 11 endpoints · Click to expand
        </p>

        {/* ── Endpoint Sections ── */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted">
              {section.title}
            </p>
            {section.endpoints.map((ep) => (
              <EndpointCard
                key={`${ep.method}:${ep.path}`}
                endpoint={ep}
                openId={openEndpointId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        ))}

        {/* ── DTO Reference ── */}
        <div className="mt-10 border-t-2 border-border pt-8">
          <p className="mb-4 px-1 text-xs font-bold uppercase tracking-wide text-muted">
            DTO Reference
          </p>
          {DTO_CARDS.map((card) => (
            <DtoCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

ApiPlaygroundPage.displayName = "ApiPlaygroundPage";
export default ApiPlaygroundPage;
