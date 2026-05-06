import { cn } from "@/lib/utils";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const percentage = Math.round(
    ((props.currentStep + 1) / props.totalSteps) * 100
  );

  return (
    <div className={cn("flex items-center gap-3", props.className)}>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-brand-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {props.showPercentage && (
        <span className="typo-ui shrink-0 text-xs tabular-nums text-neutral-400">
          {percentage}%
        </span>
      )}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
export default ProgressBar;
