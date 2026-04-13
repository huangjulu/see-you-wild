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
      className="typo-ui text-sm opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded-sm transition-opacity duration-300"
    >
      {props.label}
    </a>
  );
};

NavLink.displayName = "NavLink";
export default NavLink;
