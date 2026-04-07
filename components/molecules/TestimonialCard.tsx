interface TestimonialCardProps {
  quote: string;
  author: string;
  trip: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = (props) => {
  return (
    <div
      className="testimonial-card gsap-reveal rounded-2xl p-6 md:p-8 break-inside-avoid mb-6"
      style={{ backgroundColor: "#FDFBF7" }}
    >
      <p
        className="text-lg md:text-xl leading-relaxed mb-4"
        style={{
          fontFamily: "var(--font-serif)",
          color: "#2C352D",
        }}
      >
        &ldquo;{props.quote}&rdquo;
      </p>
      <div>
        <p className="font-medium text-sm" style={{ color: "#2C352D" }}>
          {props.author}
        </p>
        <p className="text-xs mt-1" style={{ color: "#A69B8D" }}>
          {props.trip}
        </p>
      </div>
    </div>
  );
};

TestimonialCard.displayName = "TestimonialCard";
export default TestimonialCard;
