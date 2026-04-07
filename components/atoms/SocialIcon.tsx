interface SocialIconProps {
  platform: "instagram";
  href: string;
  className?: string;
}

const icons = {
  instagram: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
};

function SocialIcon(props: SocialIconProps) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Follow us on ${props.platform}`}
      className={`text-white/70 hover:text-white transition-colors duration-300 ${props.className ?? ""}`}
    >
      {icons[props.platform]}
    </a>
  );
}

SocialIcon.displayName = "SocialIcon";
export default SocialIcon;
