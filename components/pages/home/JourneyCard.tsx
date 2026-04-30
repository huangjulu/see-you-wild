interface JourneyCardProps {
  title: string;
  subtitle: string;
  image: string;
  href?: string;
}

const JourneyCard: React.FC<JourneyCardProps> = (props) => {
  const content = (
    <div className="relative h-80 md:h-100 rounded-2xl overflow-hidden">
      <img
        src={props.image}
        alt={props.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-linear-sto-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="typo-overline text-sm mb-2 text-primary-500">
          {props.subtitle}
        </p>
        <h3 className="typo-heading text-2xl text-white">{props.title}</h3>
      </div>
    </div>
  );

  if (props.href != null) {
    return (
      <a
        href={props.href}
        className="journey-card shrink-0 w-60 md:w-105 group"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="journey-card shrink-0 w-60 md:w-105 group">{content}</div>
  );
};

JourneyCard.displayName = "JourneyCard";
export default JourneyCard;
