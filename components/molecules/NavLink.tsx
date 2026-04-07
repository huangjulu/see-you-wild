"use client";

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = (props) => {
  return (
    <a
      href={props.href}
      onClick={props.onClick}
      className="text-sm font-sans tracking-wider text-white/70 hover:text-white transition-colors duration-300"
    >
      {props.label}
    </a>
  );
};

NavLink.displayName = "NavLink";
export default NavLink;
