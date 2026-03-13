interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-block px-4 py-1 text-xs font-sans font-medium tracking-widest uppercase border border-white/40 rounded-full text-white/80 ${className}`}
    >
      {children}
    </span>
  );
}
