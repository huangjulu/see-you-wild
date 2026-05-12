import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  rowClassName?: string;
}

const Skeleton: React.FC<SkeletonProps> = (props) => {
  const { rows = 1, rowClassName, className, ...rest } = props;

  if (rows === 1) {
    return (
      <div {...rest} className={cn("skeleton-shimmer rounded-md", className)} />
    );
  }

  return (
    <div {...rest} className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={cn("skeleton-shimmer rounded-md", rowClassName)}
        />
      ))}
    </div>
  );
};

Skeleton.displayName = "Skeleton";
export default Skeleton;
