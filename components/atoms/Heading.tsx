import React from "react";
import { cn } from "@/lib/utils";

type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  level: Level;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Heading: React.FC<HeadingProps> = (props) => {
  const HeadingTag = props.level;
  return (
    <HeadingTag id={props.id} className={cn("typo-heading", props.className)}>
      {props.children}
    </HeadingTag>
  );
};

Heading.displayName = "Heading";
export default Heading;
