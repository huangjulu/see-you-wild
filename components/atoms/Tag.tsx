import React from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

const Tag: React.FC<TagProps> = (props) => {
  return (
    <span
      className={cn(
        "typo-overline inline-block px-4 py-1 text-xs border border-foreground/40 rounded-full text-foreground/80",
        props.className
      )}
    >
      {props.children}
    </span>
  );
};

Tag.displayName = "Tag";
export default Tag;
