import { cn } from "@/lib/utils";

interface TextProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}

const Text: React.FC<TextProps> = (props) => {
  return (
    <p
      className={cn(
        "typo-body",
        props.muted ? "text-muted" : "text-foreground",
        props.className
      )}
    >
      {props.children}
    </p>
  );
};

Text.displayName = "Text";
export default Text;
