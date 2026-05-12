import { cn } from "@/lib/utils";

interface SummaryBarProps {
  count: number;
}

const SummaryBar: React.FC<SummaryBarProps> = (props) => {
  if (props.count <= 0) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center px-6 py-2.5",
        "border-b border-brand-200 bg-surface-warm",
        "transition-opacity duration-300"
      )}
    >
      <span className="typo-ui text-sm text-brand-600">
        ⚠ <strong>{props.count} 筆付款待審核</strong>
      </span>
    </div>
  );
};

SummaryBar.displayName = "SummaryBar";
export default SummaryBar;
