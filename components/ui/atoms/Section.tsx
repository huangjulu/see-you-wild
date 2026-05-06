import React from "react";

import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "main";
}

const Section: React.FC<SectionProps> = (props) => {
  const { as: Tag = "section", className, children, ...restProps } = props;
  return (
    <Tag
      className={cn(
        "mx-auto max-w-7xl px-6 md:px-12",
        "grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12",
        "gap-3 md:gap-4 lg:gap-6",
        className
      )}
      {...restProps}
    >
      {children}
    </Tag>
  );
};

Section.displayName = "Section";
export default Section;
