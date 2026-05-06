import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  trip: string;
  rotate: string;
  wrapperOffset: string;
}

const PAPER_SHADOW =
  "shadow-[0_1px_0_0_rgba(200,180,160,0.3),0_2px_4px_-1px_rgba(45,58,64,0.06),1px_0_0_0_rgba(200,180,160,0.15),-1px_0_0_0_rgba(200,180,160,0.15)]";

const TestimonialCard: React.FC<TestimonialCardProps> = (props) => {
  return (
    <div
      className={cn(
        "testimonial-card gsap-reveal [transform-style:preserve-3d]",
        props.wrapperOffset
      )}
    >
      <div className="testimonial-repel will-change-transform">
        <div
          className={cn(
            "relative bg-surface-warm px-8 py-10",
            "border border-brand-200/40",
            PAPER_SHADOW,
            props.rotate,
            "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "hover:-translate-y-2 hover:rotate-0",
            "hover:shadow-[0_1px_0_0_rgba(200,180,160,0.4),0_14px_40px_-8px_rgba(45,58,64,0.13),1px_0_0_0_rgba(200,180,160,0.2),-1px_0_0_0_rgba(200,180,160,0.2)]"
          )}
        >
          <p className="typo-body text-base md:text-lg font-light leading-relaxed text-primary mb-8">
            {props.quote}
          </p>
          <p className="typo-ui text-[11px] font-medium tracking-[0.2em] uppercase text-primary">
            {props.author}
          </p>
          <p className="typo-ui text-[10px] tracking-[0.15em] text-accent mt-1">
            {props.trip}
          </p>
        </div>
      </div>
    </div>
  );
};

TestimonialCard.displayName = "TestimonialCard";
export default TestimonialCard;
