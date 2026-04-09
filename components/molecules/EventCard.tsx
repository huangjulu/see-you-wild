import Image from "next/image";
import { cn } from "@/lib/utils";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Button from "@/components/atoms/Button";
import Tag from "@/components/atoms/Tag";

interface EventCardProps {
  tag: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  cta: string;
  ctaUrl: string;
  image: string;
  imageAlt: string;
  theme: "solid" | "ghost";
  reverse?: boolean;
}

const EventCard: React.FC<EventCardProps> = (props) => {
  const reverse = props.reverse ?? false;

  return (
    <article
      className={cn(
        "flex flex-col gap-8 md:gap-12 items-center",
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      )}
    >
      <div className="w-full md:w-1/2 overflow-hidden rounded-2xl">
        <Image
          src={props.image}
          alt={props.imageAlt}
          width={800}
          height={533}
          className="w-full h-auto object-cover rounded-2xl"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <Tag>{props.tag}</Tag>
        <Heading
          level="h3"
          className="text-2xl md:text-3xl font-semibold leading-tight"
        >
          {props.title}
        </Heading>
        <Text className="text-lg text-accent font-serif">{props.subtitle}</Text>
        <Text muted className="text-sm">
          {props.date}
        </Text>
        <Text muted className="leading-relaxed">
          {props.description}
        </Text>
        <div className="pt-2">
          <Button
            theme={props.theme}
            href={props.ctaUrl}
            ariaLabel={`${props.cta} — ${props.title}`}
          >
            {props.cta}
          </Button>
        </div>
      </div>
    </article>
  );
};

EventCard.displayName = "EventCard";
export default EventCard;
