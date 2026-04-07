type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  level: Level;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

function Heading(props: HeadingProps) {
  const Tag = props.level;
  return (
    <Tag id={props.id} className={`font-serif ${props.className ?? ""}`}>
      {props.children}
    </Tag>
  );
}

Heading.displayName = "Heading";
export default Heading;
