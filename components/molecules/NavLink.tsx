"use client";

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

export default function NavLink({ href, label, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm font-sans tracking-wider text-white/70 hover:text-white transition-colors duration-300"
    >
      {label}
    </a>
  );
}
