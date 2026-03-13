interface TextProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}

export default function Text({ children, className = "", muted = false }: TextProps) {
  return (
    <p className={`font-sans ${muted ? "text-text-muted" : "text-text-primary"} ${className}`}>
      {children}
    </p>
  );
}
