import { cn } from "@/lib/utils";

interface SocialIconProps {
  platform: keyof typeof icons;
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
  line: (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
      >
        <path d="M22 10.6c0-4.8-4.5-8.6-10-8.6S2 5.8 2 10.6c0 4.3 3.6 7.8 8.4 8.5.3.1.8.2.9.5.1.3.1.6 0 .9l-.1.9c0 .3-.2 1 .9.6s5.7-3.5 7.8-6c1.4-1.6 2.1-3.3 2.1-5.4z" />
      </svg>
      <span className="text-xs font-bold tracking-wide">LINE</span>
    </span>
  ),
};

const ariaLabels: Record<string, string> = {
  instagram: "Follow us on Instagram",
  line: "Chat with us on LINE",
};

const SocialIcon = (props: SocialIconProps) => {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabels[props.platform] ?? `Visit our ${props.platform}`}
      className={cn(
        "inline-flex items-center justify-center min-w-11 min-h-11 text-white/70 hover:text-white transition-colors duration-300",
        props.className
      )}
    >
      {icons[props.platform]}
    </a>
  );
};

SocialIcon.displayName = "SocialIcon";
export default SocialIcon;
