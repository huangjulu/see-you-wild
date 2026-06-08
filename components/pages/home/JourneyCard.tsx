import Heading from "@/components/ui/atoms/Heading";
import { Link } from "@/lib/i18n/navigation";

interface JourneyCardProps {
  title: string;
  subtitle: string;
  image: string;
  href?: string;
}

const JourneyCard = (props: JourneyCardProps) => {
  const content = (
    <div className="relative h-80 md:h-100 rounded-2xl overflow-hidden">
      <img
        src={props.image}
        alt={props.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-linear-sto-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Heading.H3
          overline={props.subtitle}
          className="text-2xl text-white text-shadow-md"
        >
          {props.title}
        </Heading.H3>
      </div>
    </div>
  );

  if (props.href != null) {
    return (
      <Link
        href={props.href}
        className="journey-card shrink-0 w-60 md:w-105 group snap-start"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="journey-card shrink-0 w-60 md:w-105 group snap-start">
      {content}
    </div>
  );
};

JourneyCard.displayName = "JourneyCard";
export default JourneyCard;
