import SocialIcon from "@/components/atoms/SocialIcon";
import { INSTAGRAM_URL } from "@/lib/constants";

const SocialLinks: React.FC<{ className?: string }> = (props) => {
  return (
    <nav
      aria-label="Social media links"
      className={`flex items-center gap-4 ${props.className ?? ""}`}
    >
      <SocialIcon platform="instagram" href={INSTAGRAM_URL} />
    </nav>
  );
};

SocialLinks.displayName = "SocialLinks";
export default SocialLinks;
