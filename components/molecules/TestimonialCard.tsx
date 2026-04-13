import { Star as IconStar, Quote as IconQuote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  trip: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = (props) => {
  return (
    <div className="testimonial-card gsap-reveal py-12 px-10 break-inside-avoid mb-6 bg-surface-warm border border-foreground/5 hover:border-muted/30 transition-all duration-1000 group">
      <div className="flex space-x-1.5 mb-8 opacity-30">
        {[...Array(5)].map((_, i) => (
          <IconStar key={i} className="w-2.5 h-2.5 fill-current" />
        ))}
      </div>
      <IconQuote className="w-6 h-6 text-muted opacity-20 mb-6 group-hover:opacity-40 transition-opacity" />
      <p className="typo-body text-base md:text-lg font-light leading-relaxed text-foreground mb-10">
        {props.quote}
      </p>
      <div className="w-8 h-px bg-muted/30 mb-5" />
      <h5 className="typo-ui text-[11px] font-medium tracking-[0.2em] uppercase text-foreground">
        {props.author}
      </h5>
      <p className="typo-ui text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1.5 font-light">
        {props.trip}
      </p>
    </div>
  );
};

TestimonialCard.displayName = "TestimonialCard";
export default TestimonialCard;
