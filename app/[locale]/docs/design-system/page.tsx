"use client";

import {
  AlertCircle as IconAlertCircle,
  AlertTriangle as IconAlertTriangle,
  ArrowRight as IconArrowRight,
  CheckCircle as IconCheckCircle,
  Info as IconInfo,
  Mail as IconMail,
  Search as IconSearch,
  X as IconX,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import Button from "@/components/ui/atoms/Button";
import Calendar from "@/components/ui/atoms/Calendar";
import Input from "@/components/ui/atoms/Input";
import RadioOption from "@/components/ui/atoms/RadioOption";
import Dialog from "@/components/ui/molecules/Dialog";
import EventCalendar from "@/components/ui/molecules/EventCalendar";
import ModalCard from "@/components/ui/molecules/ModalCard";
import Selector from "@/components/ui/molecules/Selector";
import { cn } from "@/lib/utils";

const brand = {
  50: "#fef6ee",
  100: "#fdeaD8",
  200: "#fad1ae",
  300: "#f0b47a",
  400: "#DE954E", // base
  500: "#c97d35",
  600: "#a8632a",
  700: "#8a4e24",
  800: "#6d3d20",
  900: "#59331d",
  950: "#371c0f",
} as const;

const neutral = {
  50: "#f4f6f5", // = base-bg
  100: "#e4e8ea",
  200: "#c8d0d5",
  300: "#a5b2ba",
  400: "#7e909a",
  500: "#5f727d",
  600: "#4a5b65",
  700: "#3c4a52",
  800: "#2d3a40", // = base-fg / primary button
  900: "#242f34",
  950: "#1a2226",
} as const;

const tertiary = {
  50: "#f0f5f9",
  100: "#dde9f1",
  200: "#bdd5e5",
  300: "#92bbd4",
  400: "#6B9DC2", // base
  500: "#4a80a8",
  600: "#3b678d",
  700: "#325474",
  800: "#2c4760",
  900: "#293c51",
  950: "#1b2836",
} as const;

const green = {
  50: "#edfdf6",
  100: "#d3fae8",
  200: "#aaf4d5",
  300: "#72e8bc",
  400: "#39d49e",
  500: "#1FAD87", // base
  600: "#0b9470",
  700: "#09765c",
  800: "#0b5d4a",
  900: "#0a4d3e",
  950: "#042b23",
} as const;

const red = {
  50: "#fbeee9",
  100: "#fadcd0",
  200: "#f7b7a1",
  300: "#ed8e67",
  400: "#dc6737",
  500: "#C74E1E", // base
  600: "#a63b16",
  700: "#892e14",
  800: "#6c2514",
  900: "#582014",
  950: "#361009",
} as const;

/* ─── Semantic Tokens ─── */

const semantic = {
  background: neutral[50],
  surface: tertiary[50],
  "surface-brand": brand[400],
  "surface-warm": brand[50],
  "surface-deep": neutral[950],
  "fill-neutral": neutral[800],
  "fill-brand": brand[400],
  "fill-critical": red[500],
  primary: neutral[800],
  secondary: neutral[500],
  disabled: neutral[400],
  accent: brand[400],
  critical: red[500],
  success: green[500],
  info: tertiary[400],
  "on-fill-neutral": "#ffffff",
  "on-fill-brand": neutral[800],
  "on-surface-brand": "#ffffff",
  "on-surface-deep": neutral[200],
  "on-surface-warm": neutral[700],
  "stroke-default": neutral[200],
  "stroke-strong": neutral[300],
  "stroke-focus": brand[200],
} as const;

/* ─── Toast Variants ─── */

const toastVariants = {
  success: {
    bg: neutral[50],
    border: green[500],
    icon: green[500],
    text: neutral[800],
  },
  error: {
    bg: neutral[50],
    border: red[500],
    icon: red[500],
    text: neutral[800],
  },
  warning: {
    bg: neutral[50],
    border: brand[500],
    icon: brand[500],
    text: neutral[800],
  },
  info: {
    bg: neutral[900],
    border: tertiary[400],
    icon: tertiary[400],
    text: neutral[100],
  },
} as const;

/* ─── Typography Scale ─── */

/**
 * 字體系統：
 *   英文：Rufina（標題 800 / 內文 500 / 小字+按鈕 600）
 *   中文：Chiron Sung HK → Noto Serif TC fallback
 *   數字：Chiron Sung HK（unicode-range 攔截）
 */

const typoScale = [
  {
    token: "typo-display-1",
    size: "text-5xl md:text-6xl lg:text-7xl",
    weight: 800,
    leading: "leading-tight",
    tracking: "tracking-wide",
    desc: "Hero headline（首頁主標題）",
    sample: "See You Wild",
  },
  {
    token: "typo-display-2",
    size: "text-4xl md:text-5xl",
    weight: 800,
    leading: "leading-tight",
    tracking: "tracking-wide",
    desc: "Section title（區塊大標題）",
    sample: "山海之間・野放靈魂",
  },
  {
    token: "typo-heading-1",
    size: "text-2xl md:text-3xl",
    weight: 800,
    leading: "leading-snug",
    tracking: "",
    desc: "Page / card heading",
    sample: "即將到來的活動",
  },
  {
    token: "typo-sub-heading",
    size: "text-xl",
    weight: 700,
    leading: "leading-snug",
    tracking: "",
    desc: "Sub-heading / modal title",
    sample: "野營私廚｜阿里山秘境",
  },
  {
    token: "typo-subtitle-1",
    size: "text-lg",
    weight: 500,
    leading: "leading-relaxed",
    tracking: "",
    desc: "Subtitle / accent text",
    sample: "與大自然最親密的相遇",
  },
  {
    token: "typo-body-1",
    size: "text-base",
    weight: 500,
    leading: "leading-relaxed",
    tracking: "",
    desc: "Body text（主要內文）",
    sample:
      "See You Wild 帶你走進台灣最美的戶外秘境，體驗野營私廚、野溪溫泉、SUP 立槳等探險活動。",
  },
  {
    token: "typo-body-2",
    size: "text-sm",
    weight: 600,
    leading: "leading-relaxed",
    tracking: "",
    desc: "Secondary body（次要內文 / 描述）",
    sample: "活動含保險、裝備租借、專業教練帶領，適合初次體驗的冒險者。",
  },
  {
    token: "typo-label",
    size: "text-sm",
    weight: 600,
    leading: "leading-normal",
    tracking: "",
    desc: "Button / form label / nav link",
    sample: "報名活動",
  },
  {
    token: "typo-overline",
    size: "text-xs",
    weight: 600,
    leading: "leading-normal",
    tracking: "tracking-[0.3em] uppercase",
    desc: "Overline / tag / category label",
    sample: "OUTDOOR ADVENTURE",
  },
  {
    token: "typo-caption",
    size: "text-xs",
    weight: 600,
    leading: "leading-normal",
    tracking: "",
    desc: "Caption / helper text / timestamp",
    sample: "2024.05.18 ・ 剩餘 5 個名額",
  },
] as const;

/* ─── Components ─── */

const Swatch: React.FC<{
  color: string;
  label: string;
  highlight?: boolean;
}> = (props) => (
  <div className="flex flex-col items-center gap-1">
    <div
      style={{ backgroundColor: props.color }}
      className={cn(
        "size-12 rounded-lg border border-black/10 shadow-sm",
        props.highlight && "ring-2 ring-black/10"
      )}
    />
    <span className="font-mono text-[10px] text-neutral-500">
      {props.color}
    </span>
    <span className="text-[10px] text-neutral-400">{props.label}</span>
  </div>
);

const ScaleRow: React.FC<{
  name: string;
  scale: Record<string, string>;
  base: string;
}> = (props) => (
  <div className="mb-8">
    <h3 className="typo-ui mb-3 text-sm text-primary">{props.name}</h3>
    <div className="flex flex-wrap gap-3">
      {Object.entries(props.scale).map(([step, color]) => (
        <Swatch
          key={step}
          color={color}
          label={step}
          highlight={color === props.base}
        />
      ))}
    </div>
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = (props) => (
  <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-neutral-400">
    {props.children}
  </h2>
);

const sections = [
  { id: "color-scales", label: "Color Scales" },
  { id: "semantic-tokens", label: "Semantic Tokens" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "slot-components", label: "Dialog / ModalCard / Calendar" },
  { id: "input", label: "Input" },
  { id: "selector", label: "Selector" },
  { id: "shadcn-components", label: "shadcn/ui Components" },
  { id: "section-rhythm", label: "Section Rhythm" },
  { id: "testimonial-card", label: "Testimonial Card" },
  { id: "toast", label: "Toast" },
  { id: "contrast-check", label: "Contrast Check" },
  { id: "mixed-pairing", label: "Mixed Pairing" },
  { id: "full-page-sim", label: "Full Page Sim" },
  { id: "token-map", label: "Token Map" },
];

const PalettePreviewPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("color-scales");

  useEffect(function observeSections() {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el != null) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8 pt-24 font-serif text-primary">
      {/* ─── Scroll Spy ─── */}
      <nav className="fixed top-24 right-8 z-50 hidden bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-stroke-default xl:block">
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(s.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={cn(
                  "block text-xs transition-colors",
                  activeSection === s.id
                    ? "text-accent font-medium"
                    : "text-secondary hover:text-primary"
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <h1 className="typo-heading mb-1 text-3xl">Design System Preview</h1>
      <p className="typo-ui mb-10 text-sm text-secondary">
        #f4f6f5 / #2d3a40 / #DE954E / #6B9DC2 / #1FAD87 / #C74E1E
        ・確認後刪除此頁
      </p>

      {/* ═══ COLOR SCALES ═══ */}
      <section id="color-scales" className="mb-16">
        <SectionLabel>Color Scales</SectionLabel>
        <ScaleRow
          name="Brand（暖砂橘 #DE954E）"
          scale={brand}
          base={brand[400]}
        />
        <ScaleRow
          name="Neutral（深炭藍 #2d3a40）"
          scale={neutral}
          base={neutral[800]}
        />
        <ScaleRow
          name="Tertiary（冷灰藍 #6B9DC2）"
          scale={tertiary}
          base={tertiary[400]}
        />
        <ScaleRow
          name="Green（自然綠 #1FAD87）"
          scale={green}
          base={green[500]}
        />
        <ScaleRow name="Red（磚紅 #C74E1E）" scale={red} base={red[500]} />
      </section>

      {/* ═══ SEMANTIC TOKENS ═══ */}
      <section id="semantic-tokens" className="mb-16">
        <SectionLabel>Semantic Tokens</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {Object.entries(semantic).map(([name, color]) => (
            <Swatch key={name} color={color} label={name} />
          ))}
        </div>
      </section>

      {/* ═══ TYPOGRAPHY ═══ */}
      <section id="typography" className="mb-16">
        <SectionLabel>Typography Scale</SectionLabel>
        <div className="space-y-0 overflow-hidden rounded-xl border border-stroke-default">
          {typoScale.map((t, i) => (
            <div
              key={t.token}
              className={cn(
                "flex gap-6 border-b border-stroke-default p-6 last:border-b-0",
                i % 2 === 0 ? "bg-background" : "bg-surface"
              )}
            >
              {/* Token info */}
              <div className="w-48 shrink-0">
                <p className="font-mono text-xs font-medium text-accent">
                  {t.token}
                </p>
                <p className="mt-1 text-xs text-neutral-400">{t.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    `w:${t.weight}`,
                    t.size.split(" ")[0],
                    t.leading,
                    t.tracking,
                  ]
                    .filter(Boolean)
                    .map((cls) => (
                      <span
                        key={cls}
                        className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600"
                      >
                        {cls}
                      </span>
                    ))}
                </div>
              </div>
              {/* Sample */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(t.size, t.leading, t.tracking)}
                  style={{ fontWeight: t.weight }}
                >
                  {t.sample}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RWD breakpoint reference */}
        <div className="mt-6 rounded-lg bg-surface p-4">
          <p className="mb-2 text-xs font-medium text-secondary">
            RWD Breakpoints（Tailwind 預設）
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-xs text-neutral-600">
            <span>sm: 640px</span>
            <span>md: 768px</span>
            <span>lg: 1024px</span>
            <span>xl: 1280px</span>
            <span>2xl: 1536px</span>
          </div>
          <p className="mt-3 mb-2 text-xs font-medium text-secondary">
            現有 RWD typography 用法
          </p>
          <div className="space-y-1 font-mono text-xs text-neutral-600">
            <p>Hero: text-4xl → md:text-6xl → lg:text-7xl</p>
            <p>Section: text-4xl → md:text-5xl</p>
            <p>Card: text-2xl → md:text-3xl</p>
            <p>Body: text-lg（不變）</p>
            <p>Label: text-sm（不變）</p>
            <p>Caption: text-xs（不變）</p>
          </div>
        </div>
      </section>

      {/* ═══ BUTTONS ═══ */}
      <section id="buttons" className="mb-16">
        <SectionLabel>Button Styles</SectionLabel>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Button theme="base">報名活動</Button>
            <span className="typo-ui text-xs text-secondary">base</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button theme="solid">立即預訂</Button>
            <span className="typo-ui text-xs text-secondary">solid</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button theme="ghost">了解更多</Button>
            <span className="typo-ui text-xs text-secondary">ghost</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button theme="outline">查看活動</Button>
            <span className="typo-ui text-xs text-secondary">outline</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button theme="text">聯繫我們</Button>
            <span className="typo-ui text-xs text-secondary">text</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button theme="link">查看所有活動</Button>
            <span className="typo-ui text-xs text-secondary">link</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button theme="danger">取消報名</Button>
            <span className="typo-ui text-xs text-secondary">danger</span>
          </div>
        </div>
      </section>

      {/* ═══ INPUT ═══ */}
      <section id="input" className="mb-16">
        <SectionLabel>Input</SectionLabel>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Sizes</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Input size="sm" label="Small" placeholder="Small input" />
            <Input
              size="md"
              label="Medium（預設）"
              placeholder="Medium input"
            />
            <Input size="lg" label="Large" placeholder="Large input" />
          </div>
        </div>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">With Icon</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Input
              label="搜尋"
              placeholder="搜尋活動..."
              icon={<IconSearch className="size-full" />}
            />
            <Input
              label="電子信箱"
              placeholder="example@email.com"
              icon={<IconMail className="size-full" />}
            />
          </div>
        </div>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Error</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Input
              label="電子信箱"
              placeholder="example@email.com"
              defaultValue="not-an-email"
              error="請輸入有效的電子信箱"
            />
          </div>
        </div>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Disabled</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Input
              label="姓名"
              placeholder="請輸入姓名"
              defaultValue="王小明"
              disabled
            />
          </div>
        </div>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Password</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Input label="密碼" type="password" placeholder="輸入密碼" />
          </div>
        </div>
      </section>

      {/* ═══ SELECTOR ═══ */}
      <section id="selector" className="mb-16">
        <SectionLabel>Selector</SectionLabel>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Basic</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Selector
              label="可載人數"
              placeholder="選擇人數"
              options={[
                { value: "3", label: "3 人" },
                { value: "4", label: "4 人" },
                { value: "5", label: "5 人" },
              ]}
            />
          </div>
        </div>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Error</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Selector
              label="可載人數"
              placeholder="選擇人數"
              options={[
                { value: "3", label: "3 人" },
                { value: "4", label: "4 人" },
                { value: "5", label: "5 人" },
              ]}
              error="必填欄位"
            />
          </div>
        </div>

        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Disabled</h3>
          <div className="flex max-w-md flex-col gap-4">
            <Selector
              label="可載人數"
              placeholder="選擇人數"
              options={[
                { value: "3", label: "3 人" },
                { value: "4", label: "4 人" },
                { value: "5", label: "5 人" },
              ]}
              disabled
            />
          </div>
        </div>
      </section>

      {/* ═══ SLOT-BASED COMPONENTS (Dialog / ModalCard) ═══ */}
      <section id="slot-components" className="mb-16">
        <SectionLabel>Slot-based Components (Dialog / ModalCard)</SectionLabel>
        <p className="typo-ui mb-6 text-xs text-neutral-400">
          Dialog / ModalCard 使用 slot 系統分類子元件。消費端傳入 sub-component
          （如 Dialog.DangerButton），父元件透過 resolveSlots 讀取 slotName
          分類到對應 slot 區域，子元件順序與 DOM 結構解耦。
        </p>

        {/* ─── Dialog ─── */}
        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Dialog</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                破壞性確認 + CloseButton
              </p>
              <Dialog title="刪除活動" message="此操作無法復原，確定要刪除嗎？">
                <Dialog.CloseButton />
                <Dialog.DangerButton>刪除</Dialog.DangerButton>
                <Dialog.OutlineButton>取消</Dialog.OutlineButton>
              </Dialog>
            </div>

            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">一般確認</p>
              <Dialog title="儲存成功" message="你的變更已儲存。">
                <Dialog.PrimaryButton>確定</Dialog.PrimaryButton>
              </Dialog>
            </div>

            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">Loading</p>
              <Dialog title="處理中" message="請稍候...">
                <Dialog.Loader />
              </Dialog>
            </div>

            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">自訂 children</p>
              <Dialog title="自訂內容">
                <p className="typo-body text-primary">
                  這是一段自訂的段落，不是預設的 message prop。
                </p>
                <Dialog.PrimaryButton>了解</Dialog.PrimaryButton>
              </Dialog>
            </div>
          </div>
        </div>

        {/* ─── ModalCard ─── */}
        <div>
          <h3 className="typo-ui mb-4 text-sm text-primary">ModalCard</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">完整組合</p>
              <ModalCard>
                <ModalCard.Header title="報名確認" description="請確認以下資訊">
                  <ModalCard.Header.CloseButton />
                </ModalCard.Header>
                <ModalCard.Main>
                  <p className="typo-body">姓名：王小明</p>
                  <p className="typo-body">活動：溪谷探險 2026/05</p>
                </ModalCard.Main>
                <ModalCard.Footer>
                  <ModalCard.Footer.BackButton>
                    上一步
                  </ModalCard.Footer.BackButton>
                  <ModalCard.Footer.CancelButton>
                    取消
                  </ModalCard.Footer.CancelButton>
                  <ModalCard.Footer.ConfirmButton>
                    確認報名
                  </ModalCard.Footer.ConfirmButton>
                </ModalCard.Footer>
              </ModalCard>
            </div>

            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">Header + Main</p>
              <ModalCard>
                <ModalCard.Header title="活動詳情" />
                <ModalCard.Main>
                  <p className="typo-body">這裡是活動的詳細說明內容。</p>
                </ModalCard.Main>
              </ModalCard>
            </div>

            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">Main + Footer</p>
              <ModalCard>
                <ModalCard.Main>
                  <p className="typo-body">
                    你確定要離開嗎？未儲存的變更將會遺失。
                  </p>
                </ModalCard.Main>
                <ModalCard.Footer>
                  <ModalCard.Footer.ConfirmButton>
                    離開
                  </ModalCard.Footer.ConfirmButton>
                </ModalCard.Footer>
              </ModalCard>
            </div>

            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                自訂 Header children
              </p>
              <ModalCard>
                <ModalCard.Header>
                  <div className="flex items-center gap-3">
                    <span className="typo-overline text-xs text-accent">
                      NEW
                    </span>
                    <h3 className="typo-heading text-lg">自訂 Header</h3>
                  </div>
                </ModalCard.Header>
                <ModalCard.Main>
                  <p className="typo-body">
                    Header 使用自訂 children 取代 title/description。
                  </p>
                </ModalCard.Main>
                <ModalCard.Footer>
                  <ModalCard.Footer.CancelButton>
                    關閉
                  </ModalCard.Footer.CancelButton>
                  <ModalCard.Footer.ConfirmButton>
                    送出
                  </ModalCard.Footer.ConfirmButton>
                </ModalCard.Footer>
              </ModalCard>
            </div>
          </div>
        </div>

        {/* ─── Calendar ─── */}
        <div className="mt-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">Calendar</h3>

          {/* Slot 組合 */}
          <p className="typo-ui mb-3 text-xs text-neutral-400">
            Slot 組合（Navi + Grid）
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                完整組合（Chevrons + Caption label）
              </p>
              <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
                <Calendar.Navi>
                  <Calendar.Chevrons />
                  <Calendar.Caption layout="label" />
                </Calendar.Navi>
                <Calendar.Grid type="month" />
              </Calendar>
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                Caption dropdown（無 Chevrons）
              </p>
              <Calendar
                mode="single"
                size="sm"
                defaultMonth={new Date(2026, 4, 1)}
                startMonth={new Date(2024, 0)}
                endMonth={new Date(2028, 11)}
              >
                <Calendar.Navi>
                  <Calendar.Caption layout="dropdown" />
                </Calendar.Navi>
                <Calendar.Grid type="month" />
              </Calendar>
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                無 children（default）
              </p>
              <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)} />
            </div>
          </div>

          {/* 尺寸展開 */}
          <p className="typo-ui mb-3 text-xs text-neutral-400">
            尺寸（sm / md / lg）
          </p>
          <div className="flex flex-wrap items-start gap-6 mb-8">
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">sm</p>
              <Calendar
                mode="single"
                size="sm"
                defaultMonth={new Date(2026, 4, 1)}
              >
                <Calendar.Grid type="month" />
              </Calendar>
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">md</p>
              <Calendar
                mode="single"
                size="md"
                defaultMonth={new Date(2026, 4, 1)}
              >
                <Calendar.Grid type="month" />
              </Calendar>
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">lg</p>
              <Calendar
                mode="single"
                size="lg"
                defaultMonth={new Date(2026, 4, 1)}
              >
                <Calendar.Grid type="month" />
              </Calendar>
            </div>
          </div>

          {/* Grid type */}
          <p className="typo-ui mb-3 text-xs text-neutral-400">
            Grid type（month / week / biweek）
          </p>
          <div className="flex flex-wrap items-start gap-6 mb-8">
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                month（fixedWeeks）
              </p>
              <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
                <Calendar.Grid type="month" />
              </Calendar>
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">
                biweek + expandLabel
              </p>
              <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
                <Calendar.Grid type="biweek" expandLabel="展開完整月份" />
              </Calendar>
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">week</p>
              <Calendar mode="single" defaultMonth={new Date(2026, 4, 1)}>
                <Calendar.Grid type="week" expandLabel="展開完整月份" />
              </Calendar>
            </div>
          </div>

          {/* Markers (EventCalendar) */}
          <p className="typo-ui mb-3 text-xs text-neutral-400">
            EventCalendar（markers: available / full）
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">Available dates</p>
              <EventCalendar
                availableDates={[
                  new Date(2026, 4, 18),
                  new Date(2026, 4, 25),
                  new Date(2026, 5, 8),
                ]}
                defaultMonth={new Date(2026, 4, 1)}
              />
            </div>
            <div className="space-y-2">
              <p className="typo-ui text-xs text-secondary">biweek + markers</p>
              <EventCalendar
                availableDates={[
                  new Date(2026, 4, 18),
                  new Date(2026, 4, 25),
                  new Date(2026, 5, 8),
                ]}
                gridType="biweek"
                expandLabel="查看更多日期"
                defaultMonth={new Date(2026, 4, 1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHADCN/UI COMPONENTS ═══ */}
      <section id="shadcn-components" className="mb-16">
        <SectionLabel>shadcn/ui Components</SectionLabel>

        {/* ─── RadioOption ─── */}
        <div className="mb-10">
          <h3 className="typo-ui mb-4 text-sm text-primary">RadioOption</h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="typo-ui text-xs text-secondary">集合站選項</p>
              <div className="flex flex-wrap gap-2">
                <RadioOption
                  name="demo-pickup"
                  value="taipei"
                  label="台北車站"
                />
                <RadioOption
                  name="demo-pickup"
                  value="banqiao"
                  label="板橋車站"
                />
                <RadioOption
                  name="demo-pickup"
                  value="taoyuan"
                  label="桃園高鐵"
                />
                <RadioOption name="demo-pickup" value="self" label="自行前往" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="typo-ui text-xs text-secondary">Disabled</p>
              <div className="flex flex-wrap gap-2">
                <RadioOption
                  name="demo-disabled"
                  value="taipei"
                  label="台北車站"
                />
                <RadioOption
                  name="demo-disabled"
                  value="banqiao"
                  label="板橋車站"
                  disabled
                />
                <RadioOption
                  name="demo-disabled"
                  value="taoyuan"
                  label="桃園高鐵"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION RHYTHM ═══ */}
      <section id="section-rhythm" className="mb-16">
        <SectionLabel>Section Rhythm（頁面區塊交錯）</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-stroke-default">
          <div className="bg-background p-8">
            <p className="typo-overline mb-1 text-xs text-neutral-400">
              base-bg (#f4f6f5)
            </p>
            <h3 className="typo-sub-heading mb-2 text-xl">
              山海之間・野放靈魂
            </h3>
            <p className="typo-ui text-sm text-secondary">
              See You Wild 帶你走進台灣最美的戶外秘境。
            </p>
          </div>
          <div className="bg-surface p-8">
            <p className="typo-overline mb-1 text-xs text-neutral-400">
              tertiary-50 (#f0f5f9)（交錯）
            </p>
            <h3 className="typo-sub-heading mb-2 text-xl">即將到來的活動</h3>
            <div className="flex gap-4">
              {["野營私廚", "野溪溫泉", "SUP 立槳"].map((name) => (
                <div
                  key={name}
                  className="flex-1 rounded-lg border border-stroke-default bg-background p-4"
                >
                  <div className="mb-2 h-24 rounded bg-neutral-200" />
                  <p className="typo-ui text-sm">{name}</p>
                  <p className="typo-ui mt-1 text-xs text-accent">2024.05.18</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-background p-8">
            <p className="typo-overline mb-1 text-xs text-neutral-400">
              base-bg
            </p>
            <h3 className="typo-sub-heading mb-2 text-xl">專屬包團服務</h3>
            <p className="typo-ui text-sm text-secondary">
              為你的團隊量身打造戶外探險行程。
            </p>
            <Button theme="text" className="mt-4 text-brand-500">
              聯繫我們 <IconArrowRight className="size-4" />
            </Button>
          </div>
          <div className="bg-surface-brand p-8 text-neutral-100">
            <p className="typo-overline mb-1 text-xs text-neutral-400">
              neutral-900 (#242f34)（Footer）
            </p>
            <h3 className="typo-sub-heading mb-2 text-xl">See You Wild</h3>
            <p className="typo-ui text-sm text-neutral-400">
              © 2024 See You Wild. All rights reserved.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIAL CARD ═══ */}
      <section id="testimonial-card" className="mb-16">
        <SectionLabel>Testimonial Card（便利貼風格）</SectionLabel>
        <p className="typo-ui mb-6 text-xs text-neutral-400">
          直角卡片 + 紙張邊緣 shadow。預設帶散落旋轉角度，hover
          時抬起擺正（剝牌效果）。背景層為 SVG ghost cards + radial gradient
          mask，外包 rounded-3xl clip 容器。
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Default state */}
          <div className="space-y-2">
            <p className="typo-ui text-xs text-secondary">Default — 散落</p>
            <div className="flex justify-center rounded-lg border border-stroke-default bg-neutral-50 p-10">
              <div
                className={cn(
                  "w-72 bg-surface-warm px-8 py-10",
                  "border border-brand-200/40",
                  "shadow-[0_1px_0_0_rgba(200,180,160,0.3),0_2px_4px_-1px_rgba(45,58,64,0.06),1px_0_0_0_rgba(200,180,160,0.15),-1px_0_0_0_rgba(200,180,160,0.15)]",
                  "rotate-[-2.5deg]"
                )}
              >
                <p className="typo-body text-base font-light leading-relaxed text-primary mb-8">
                  在野溪溫泉裡仰望星空的那一刻，我覺得這才是人生該有的樣子。
                </p>
                <p className="typo-ui text-[11px] font-medium tracking-[0.2em] uppercase text-primary">
                  Ava L.
                </p>
                <p className="typo-ui text-[10px] tracking-[0.15em] text-accent mt-1">
                  野溪溫泉秘境團
                </p>
              </div>
            </div>
          </div>
          {/* Hover state */}
          <div className="space-y-2">
            <p className="typo-ui text-xs text-secondary">Hover — 挑起</p>
            <div className="flex justify-center rounded-lg border border-stroke-default bg-neutral-50 p-10">
              <div
                className={cn(
                  "w-72 bg-surface-warm px-8 py-10",
                  "border border-brand-200/40",
                  "shadow-[0_1px_0_0_rgba(200,180,160,0.4),0_14px_40px_-8px_rgba(45,58,64,0.13),1px_0_0_0_rgba(200,180,160,0.2),-1px_0_0_0_rgba(200,180,160,0.2)]",
                  "rotate-0 -translate-y-2"
                )}
              >
                <p className="typo-body text-base font-light leading-relaxed text-primary mb-8">
                  在野溪溫泉裡仰望星空的那一刻，我覺得這才是人生該有的樣子。
                </p>
                <p className="typo-ui text-[11px] font-medium tracking-[0.2em] uppercase text-primary">
                  Ava L.
                </p>
                <p className="typo-ui text-[10px] tracking-[0.15em] text-accent mt-1">
                  野溪溫泉秘境團
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Spec notes */}
        <div className="mt-6 rounded-lg bg-surface p-4">
          <p className="mb-2 text-xs font-medium text-secondary">Motion Spec</p>
          <div className="space-y-1 font-mono text-xs text-neutral-600">
            <p>
              Scroll reveal: opacity 0→1, duration 1s, power3.out（整組一次，不
              stagger）
            </p>
            <p>
              Hover: translateY(-8px) + rotate(0deg) + shadow-lg, 500ms
              cubic-bezier(0.23, 1, 0.32, 1)
            </p>
            <p>Reduced motion: 跳過 fade-in，hover 保留</p>
          </div>
        </div>
      </section>

      {/* ═══ TOAST ═══ */}
      <section id="toast" className="mb-16">
        <SectionLabel>Toast Variants</SectionLabel>
        <div className="flex flex-col gap-4">
          {(
            Object.entries(toastVariants) as [
              string,
              (typeof toastVariants)[keyof typeof toastVariants],
            ][]
          ).map(([key, v]) => (
            <div
              key={key}
              className="flex w-95 flex-col gap-3 rounded-lg border-l-4 p-4 shadow-md"
              style={{
                backgroundColor: v.bg,
                borderLeftColor: v.border,
                color: v.text,
              }}
            >
              <div className="flex items-start gap-3">
                <span style={{ color: v.icon }}>
                  {key === "success" && <IconCheckCircle className="size-5" />}
                  {key === "error" && <IconAlertCircle className="size-5" />}
                  {key === "warning" && (
                    <IconAlertTriangle className="size-5" />
                  )}
                  {key === "info" && <IconInfo className="size-5" />}
                </span>
                <p className="min-w-0 flex-1 text-sm leading-relaxed">
                  {key === "success" && "報名成功！確認信已寄出。"}
                  {key === "error" && "付款處理失敗，請檢查卡片資訊。"}
                  {key === "warning" && "此活動僅剩 2 個名額。"}
                  {key === "info" && "系統維護通知：4/15 暫停服務。"}
                </p>
                <button style={{ color: v.icon, opacity: 0.5 }}>
                  <IconX className="size-4" />
                </button>
              </div>
              {key === "error" && (
                <div className="pl-8">
                  <button
                    className="rounded-full border px-4 py-1.5 text-xs font-medium"
                    style={{ borderColor: v.border, color: v.text }}
                  >
                    重試
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTRAST CHECK ═══ */}
      <section id="contrast-check" className="mb-16">
        <SectionLabel>Typography Contrast Check</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-stroke-default bg-background p-6">
            <p className="mb-1 text-xs text-neutral-400">
              On base-bg (#f4f6f5)
            </p>
            <p className="text-lg text-primary">標題文字 Heading</p>
            <p className="text-sm text-secondary">次要文字 Secondary text</p>
            <p className="text-sm text-accent">強調色文字 Primary accent</p>
            <p className="text-sm text-success">成功色文字 Success</p>
            <p className="text-sm text-error">錯誤色文字 Error</p>
          </div>
          <div className="rounded-lg bg-surface p-6">
            <p className="mb-1 text-xs text-neutral-400">
              On tertiary-50 (#f0f5f9)
            </p>
            <p className="text-lg text-primary">標題文字 Heading</p>
            <p className="text-sm text-secondary">次要文字 Secondary text</p>
            <p className="text-sm text-accent">強調色文字 Primary accent</p>
          </div>
          <div className="rounded-lg bg-surface-brand p-6">
            <p className="mb-1 text-xs text-neutral-400">
              On neutral-900 (#242f34)
            </p>
            <p className="text-lg text-neutral-100">標題文字 Heading</p>
            <p className="text-sm text-neutral-400">次要文字 Secondary text</p>
            <p className="text-sm text-accent">強調色文字 Primary accent</p>
            <p className="text-sm text-info">Tertiary accent</p>
          </div>
          <div className="rounded-lg bg-brand-400 p-6">
            <p className="mb-1 text-xs text-brand-900">
              On brand-400 (#DE954E)
            </p>
            <p className="text-lg text-primary">標題文字 Heading</p>
            <p className="text-sm text-neutral-700">次要文字 Secondary text</p>
            <p className="text-sm text-white">白色文字 White text</p>
          </div>
        </div>
      </section>

      {/* ═══ MIXED PAIRING ═══ */}
      <section id="mixed-pairing" className="mb-16">
        <SectionLabel>
          搭配組合 — Rufina（英文）+ Chiron Sung HK（中文）
        </SectionLabel>
        <p className="mb-6 typo-ui text-xs text-neutral-400">
          typo-heading / typo-sub-heading / typo-body / typo-ui / typo-overline
          ・數字走 Chiron Sung HK
        </p>
        <div className="overflow-hidden rounded-xl border border-stroke-default">
          <div className="bg-background p-8">
            <p className="typo-overline mb-1 text-xs text-accent">
              Outdoor Adventure
            </p>
            <h2 className="typo-heading mb-3 text-4xl leading-tight text-primary">
              山海之間・野放靈魂
            </h2>
            <p className="typo-body mb-4 text-lg leading-relaxed text-neutral-600">
              See You Wild
              帶你走進台灣最美的戶外秘境，體驗野營私廚、野溪溫泉、SUP
              立槳等探險活動。在星空下享受私廚料理，感受最純粹的戶外體驗。
            </p>
            <button className="typo-ui rounded-full bg-foreground px-8 py-3 text-sm tracking-widest text-white">
              立即報名
            </button>
          </div>
          <div className="bg-surface p-8">
            <h3 className="typo-sub-heading mb-2 text-2xl text-primary">
              即將到來的活動
            </h3>
            <div className="flex gap-4">
              {["野營私廚", "野溪溫泉", "SUP 立槳"].map((name) => (
                <div
                  key={name}
                  className="flex-1 rounded-lg border border-stroke-default bg-background p-4"
                >
                  <div className="mb-2 h-24 rounded bg-neutral-200" />
                  <p className="typo-body text-base">{name}</p>
                  <p className="typo-ui mt-1 text-xs text-accent">2024.05.18</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-brand p-8">
            <h3 className="typo-sub-heading mb-2 text-2xl text-neutral-100">
              See You Wild
            </h3>
            <p className="typo-ui text-sm leading-relaxed text-neutral-400">
              台灣戶外探險品牌 — 山海之間・野放靈魂
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FULL PAGE SIMULATION ═══ */}
      <section id="full-page-sim" className="mb-16">
        <SectionLabel>全站模擬 — Rufina + Chiron Sung HK</SectionLabel>
        <div className="overflow-hidden rounded-xl border border-stroke-default">
          {/* Hero */}
          <div className="relative bg-surface-brand p-12 pb-16">
            <p className="typo-overline mb-2 text-xs text-accent">
              Taiwan Outdoor Adventure
            </p>
            <h1 className="typo-display mb-4 text-5xl leading-tight text-neutral-100">
              See You Wild
            </h1>
            <p className="typo-sub-heading mb-6 text-2xl text-neutral-100">
              山海之間・野放靈魂
            </p>
            <p className="typo-body max-w-xl text-base leading-relaxed text-neutral-400">
              走進台灣最美的戶外秘境，在星空下享受私廚料理、在野溪中感受溫泉的溫度、在海面上划出屬於自己的軌跡。
            </p>
            <button className="typo-ui mt-6 rounded-full bg-fill-brand px-8 py-3 text-sm tracking-widest text-primary">
              探索活動
            </button>
          </div>

          {/* Events */}
          <div className="bg-surface p-8">
            <p className="typo-overline mb-1 text-xs text-neutral-400">
              Upcoming Events
            </p>
            <h2 className="typo-heading mb-6 text-3xl text-primary">
              即將到來的活動
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  name: "野營私廚｜阿里山秘境",
                  date: "2024.05.18 — 05.19",
                  desc: "在海拔兩千公尺的雲霧之間，品嚐主廚以在地食材打造的八道式料理。夜晚仰望無光害的星空，聽風穿越竹林的聲音。",
                  spots: "剩餘 5 位",
                },
                {
                  name: "野溪溫泉｜栗松秘境",
                  date: "2024.06.01 — 06.02",
                  desc: "穿越溪谷、攀越巨石，抵達被五彩礦物染色的天然溫泉。四小時的跋涉之後，泡進大自然的浴池裡，值得每一步。",
                  spots: "剩餘 8 位",
                },
                {
                  name: "SUP 立槳｜花蓮清水斷崖",
                  date: "2024.06.15",
                  desc: "在太平洋的湛藍中划行，仰望垂直千尺的斷崖。專業教練全程帶領，適合初學者。日出團限定 12 人。",
                  spots: "即將額滿",
                },
              ].map((event) => (
                <div
                  key={event.name}
                  className="rounded-lg border border-stroke-default bg-background"
                >
                  <div className="h-36 rounded-t-lg bg-neutral-200" />
                  <div className="p-4">
                    <p className="typo-ui text-xs text-accent">{event.date}</p>
                    <h3 className="typo-sub-heading mt-1 text-lg leading-snug text-primary">
                      {event.name}
                    </h3>
                    <p className="typo-ui mt-2 text-sm leading-relaxed text-neutral-500">
                      {event.desc}
                    </p>
                    <p className="typo-ui mt-3 text-xs text-neutral-400">
                      {event.spots}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy */}
          <div className="bg-background p-8">
            <p className="typo-overline mb-1 text-xs text-neutral-400">
              Our Philosophy
            </p>
            <h2 className="typo-display mb-4 text-3xl text-primary">
              Between Mountains & Sea
            </h2>
            <p className="typo-sub-heading mb-4 text-2xl text-primary">
              不只是旅行，是與土地的對話
            </p>
            <div className="max-w-2xl space-y-4">
              <p className="typo-body text-base leading-loose text-neutral-600">
                我們相信，真正的探險不是征服自然，而是走進自然。每一條溪流都有它的故事，每一座山都在等待被傾聽。See
                You Wild
                存在的意義，是帶你去那些地圖上找不到的角落，用五感重新認識這座島嶼。
              </p>
              <p className="typo-body text-base leading-loose text-neutral-600">
                從創辦至今，我們帶領超過三千位冒險者走入山林、划過海洋、泡過野溪。每一次出發，都是一次對日常的溫柔叛逃。我們不追求極限，追求的是那個讓你忘記手機存在的瞬間。
              </p>
              <p className="typo-ui text-sm leading-relaxed text-neutral-400">
                — See You Wild 團隊
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-surface p-8">
            <h2 className="typo-sub-heading mb-2 text-2xl text-primary">
              專屬包團服務
            </h2>
            <p className="typo-body mb-4 text-base leading-relaxed text-neutral-600">
              企業團建、家族旅行、好友揪團——告訴我們你的想像，我們幫你打造專屬的戶外行程。人數、日期、預算都可以客製化。
            </p>
            <p className="typo-sub-heading text-lg text-accent">
              seeyouwild.tw@gmail.com
            </p>
            <p className="typo-ui mt-1 text-sm text-neutral-400">
              通常在 24 小時內回覆
            </p>
          </div>

          {/* Form stress test */}
          <div className="bg-background p-8">
            <h2 className="typo-sub-heading mb-4 text-2xl text-primary">
              報名表單（小字號壓力測試）
            </h2>
            <div className="max-w-md space-y-3">
              {[
                { label: "姓名", placeholder: "請輸入您的全名" },
                { label: "電子信箱", placeholder: "example@email.com" },
                { label: "聯絡電話", placeholder: "0912-345-678" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="typo-ui mb-1 block text-sm text-primary">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="typo-ui w-full rounded-md border border-stroke-default bg-background px-3 py-2 text-sm text-primary"
                  />
                </div>
              ))}
              <p className="typo-ui text-xs leading-relaxed text-neutral-400">
                送出即表示您同意我們的服務條款與隱私權政策。您的個人資料僅用於活動聯繫，不會提供給第三方。如需取消報名，請於活動三天前來信通知。
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-brand p-8">
            <h3 className="typo-display mb-1 text-xl text-neutral-100">
              See You Wild
            </h3>
            <p className="typo-ui text-sm text-neutral-400">
              台灣戶外探險品牌 — 山海之間・野放靈魂
            </p>
            <p className="typo-ui mt-4 text-xs text-neutral-500">
              © 2024 See You Wild. All rights reserved. 西揪團有限公司 統編
              12345678
            </p>
          </div>
        </div>
      </section>

      {/* ═══ TOKEN MAP ═══ */}
      <section id="token-map" className="mb-16">
        <SectionLabel>Proposed globals.css Token Map</SectionLabel>
        <pre className="overflow-x-auto rounded-lg bg-surface-brand p-6 font-mono text-xs leading-relaxed text-neutral-300">
          {`@theme {
  /* ─── Brand（暖砂橘 #DE954E）─── */
  --color-brand-50:  ${brand[50]};
  --color-brand-100: ${brand[100]};
  --color-brand-200: ${brand[200]};
  --color-brand-300: ${brand[300]};
  --color-brand-400: ${brand[400]};   /* base */
  --color-brand-500: ${brand[500]};
  --color-brand-600: ${brand[600]};
  --color-brand-700: ${brand[700]};
  --color-brand-800: ${brand[800]};
  --color-brand-900: ${brand[900]};
  --color-brand-950: ${brand[950]};

  /* ─── Neutral（深炭藍 #2d3a40）─── */
  --color-neutral-50:  ${neutral[50]};    /* = base-bg */
  --color-neutral-100: ${neutral[100]};
  --color-neutral-200: ${neutral[200]};
  --color-neutral-300: ${neutral[300]};
  --color-neutral-400: ${neutral[400]};
  --color-neutral-500: ${neutral[500]};
  --color-neutral-600: ${neutral[600]};
  --color-neutral-700: ${neutral[700]};
  --color-neutral-800: ${neutral[800]};   /* = base-fg / button */
  --color-neutral-900: ${neutral[900]};
  --color-neutral-950: ${neutral[950]};

  /* ─── Tertiary（冷灰藍 #6B9DC2）─── */
  --color-tertiary-50:  ${tertiary[50]};
  --color-tertiary-100: ${tertiary[100]};
  --color-tertiary-200: ${tertiary[200]};
  --color-tertiary-300: ${tertiary[300]};
  --color-tertiary-400: ${tertiary[400]};   /* base */
  --color-tertiary-500: ${tertiary[500]};
  --color-tertiary-600: ${tertiary[600]};
  --color-tertiary-700: ${tertiary[700]};
  --color-tertiary-800: ${tertiary[800]};
  --color-tertiary-900: ${tertiary[900]};
  --color-tertiary-950: ${tertiary[950]};

  /* ─── Green（自然綠 #1FAD87）─── */
  --color-green-50:  ${green[50]};
  --color-green-100: ${green[100]};
  --color-green-200: ${green[200]};
  --color-green-300: ${green[300]};
  --color-green-400: ${green[400]};
  --color-green-500: ${green[500]};   /* base */
  --color-green-600: ${green[600]};
  --color-green-700: ${green[700]};
  --color-green-800: ${green[800]};
  --color-green-900: ${green[900]};
  --color-green-950: ${green[950]};

  /* ─── Red（磚紅 #C74E1E）─── */
  --color-red-50:  ${red[50]};
  --color-red-100: ${red[100]};
  --color-red-200: ${red[200]};
  --color-red-300: ${red[300]};
  --color-red-400: ${red[400]};
  --color-red-500: ${red[500]};   /* base */
  --color-red-600: ${red[600]};
  --color-red-700: ${red[700]};
  --color-red-800: ${red[800]};
  --color-red-900: ${red[900]};
  --color-red-950: ${red[950]};

  /* ─── Semantic / Surface ─── */
  --color-background:    ${neutral[50]};
  --color-surface:       ${tertiary[50]};
  --color-surface-brand: ${brand[400]};
  --color-surface-warm:  ${brand[50]};
  --color-surface-deep:  ${neutral[950]};

  /* ─── Semantic / Fill ─── */
  --color-fill-neutral:  ${neutral[800]};
  --color-fill-brand:    ${brand[400]};
  --color-fill-critical: ${red[500]};

  /* ─── Semantic / Text ─── */
  --color-primary:   ${neutral[800]};
  --color-secondary: ${neutral[500]};
  --color-disabled:  ${neutral[400]};
  --color-accent:    ${brand[400]};
  --color-critical:  ${red[500]};
  --color-success:   ${green[500]};
  --color-info:      ${tertiary[400]};

  /* ─── Semantic / On-* ─── */
  --color-on-fill-neutral:   #ffffff;
  --color-on-fill-brand:     ${neutral[800]};
  --color-on-surface-brand:  #ffffff;
  --color-on-surface-deep:   ${neutral[200]};
  --color-on-surface-warm:   ${neutral[700]};

  /* ─── Semantic / Stroke ─── */
  --color-stroke-default: ${neutral[200]};
  --color-stroke-strong:  ${neutral[300]};
  --color-stroke-focus:   ${brand[200]};

  /* ─── Fonts ─── */
  --font-serif: var(--font-rufina), "Rufina", var(--font-chiron-sung-hk), "Chiron Sung HK", var(--font-noto-serif-tc), "Noto Serif TC", serif;
  --font-sans: var(--font-noto-sans-tc), "Noto Sans TC", sans-serif;

  /* ─── Font Weights ─── */
  /* heading: 800 / body: 500 / small+button: 600 */
  /* 數字透過 SerifDigits @font-face（unicode-range）走 Chiron Sung HK */
}`}
        </pre>
      </section>
    </div>
  );
};

PalettePreviewPage.displayName = "PalettePreviewPage";
export default PalettePreviewPage;
