import SocialIcon from "@/components/atoms/SocialIcon";
import { INSTAGRAM_URL } from "@/lib/constants";

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Social media links" className={`flex items-center gap-4 ${className}`}>
      <SocialIcon platform="instagram" href={INSTAGRAM_URL} />
    </nav>
  );
}
