import React from "react";

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

const Tag: React.FC<TagProps> = (props) => {
  return (
    <span
      className={`inline-block px-4 py-1 text-xs font-sans font-medium tracking-widest uppercase border border-white/40 rounded-full text-white/80 ${props.className ?? ""}`}
    >
      {props.children}
    </span>
  );
};

Tag.displayName = "Tag";
export default Tag;
