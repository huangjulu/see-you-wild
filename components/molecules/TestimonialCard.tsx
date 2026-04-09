interface TestimonialCardProps {
  quote: string;
  author: string;
  trip: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = (props) => {
  return (
    <div className="testimonial-card gsap-reveal rounded-2xl p-6 md:p-8 break-inside-avoid mb-6 bg-background">
      <p className="typo-body text-lg md:text-xl leading-relaxed mb-4 text-foreground">
        &ldquo;{props.quote}&rdquo;
      </p>
      <div>
        <p className="typo-ui text-sm text-foreground">{props.author}</p>
        <p className="typo-ui text-xs mt-1 text-neutral-400">{props.trip}</p>
      </div>
    </div>
  );
};

TestimonialCard.displayName = "TestimonialCard";
export default TestimonialCard;
