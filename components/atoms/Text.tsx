import React from "react";

interface TextProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}

const Text: React.FC<TextProps> = (props) => {
  return (
    <p
      className={`font-sans ${props.muted ? "text-text-muted" : "text-text-primary"} ${props.className ?? ""}`}
    >
      {props.children}
    </p>
  );
};

Text.displayName = "Text";
export default Text;
