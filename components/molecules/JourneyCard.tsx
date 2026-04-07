interface JourneyCardProps {
  title: string;
  subtitle: string;
  image: string;
}

const JourneyCard: React.FC<JourneyCardProps> = (props) => {
  return (
    <div className="journey-card flex-shrink-0 w-[320px] md:w-[400px] group cursor-pointer">
      <div className="relative h-[450px] md:h-[520px] rounded-2xl overflow-hidden">
        <img
          src={props.image}
          alt={props.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p
            className="text-sm tracking-[0.2em] uppercase mb-2"
            style={{ color: "#A69B8D" }}
          >
            {props.subtitle}
          </p>
          <h3
            className="text-2xl text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {props.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

JourneyCard.displayName = "JourneyCard";
export default JourneyCard;
