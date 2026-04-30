import { cn } from "@/lib/utils";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  return (
    <div className={cn("flex gap-1.5", props.className)}>
      {Array.from({ length: props.totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            index < props.currentStep && "bg-neutral-200",
            index === props.currentStep && "bg-brand-400",
            index > props.currentStep && "bg-neutral-100"
          )}
        />
      ))}
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
export default ProgressBar;
