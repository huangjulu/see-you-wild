import SocialIcon from "@/components/ui/atoms/SocialIcon";
import { INSTAGRAM_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SocialLinks: React.FC<{ className?: string }> = (props) => {
  return (
    <nav
      aria-label="Social media links"
      className={cn("flex items-center gap-4", props.className)}
    >
      <SocialIcon platform="instagram" href={INSTAGRAM_URL} />
    </nav>
  );
};

SocialLinks.displayName = "SocialLinks";
export default SocialLinks;
