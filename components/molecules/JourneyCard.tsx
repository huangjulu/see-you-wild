interface JourneyCardProps {
  title: string;
  subtitle: string;
  image: string;
}

const JourneyCard: React.FC<JourneyCardProps> = (props) => {
  return (
    <div className="journey-card flex-shrink-0 w-80 md:w-100 group cursor-pointer">
      <div className="relative h-[450px] md:h-130 rounded-2xl overflow-hidden">
        <img
          src={props.image}
          alt={props.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="typo-overline text-sm mb-2 text-neutral-400">
            {props.subtitle}
          </p>
          <h3 className="typo-heading text-2xl text-white">{props.title}</h3>
        </div>
      </div>
    </div>
  );
};

JourneyCard.displayName = "JourneyCard";
export default JourneyCard;
