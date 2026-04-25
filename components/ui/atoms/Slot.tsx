import { cn } from "@/lib/utils";

interface SlotProps {
  slot: string;
  ["data-slot"]?: string;
  className?: string;
  children?: React.ReactNode;
}

const Slot: React.FC<SlotProps> = (props) => (
  <div data-slot={props.slot} className={cn("contents", props.className)}>
    {props.children}
  </div>
);

Slot.displayName = "Slot";
export default Slot;
