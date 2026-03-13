type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  level: Level;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Heading({ level, children, className = "", id }: HeadingProps) {
  const Tag = level;
  return <Tag id={id} className={`font-serif ${className}`}>{children}</Tag>;
}
