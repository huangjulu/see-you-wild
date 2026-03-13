import Image from "next/image";
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
  variant: "solid" | "ghost";
  reverse?: boolean;
}

export default function EventCard({
  tag,
  title,
  subtitle,
  date,
  description,
  cta,
  ctaUrl,
  image,
  imageAlt,
  variant,
  reverse = false,
}: EventCardProps) {
  return (
    <article
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-8 md:gap-12 items-center`}
    >
      <div className="w-full md:w-1/2 overflow-hidden rounded-2xl">
        <Image
          src={image}
          alt={imageAlt}
          width={800}
          height={533}
          className="w-full h-auto object-cover rounded-2xl"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <Tag>{tag}</Tag>
        <Heading level="h3" className="text-2xl md:text-3xl font-semibold leading-tight">
          {title}
        </Heading>
        <Text className="text-lg text-accent font-serif">{subtitle}</Text>
        <Text muted className="text-sm">{date}</Text>
        <Text muted className="leading-relaxed">{description}</Text>
        <div className="pt-2">
          <Button variant={variant} href={ctaUrl} ariaLabel={`${cta} — ${title}`}>
            {cta}
          </Button>
        </div>
      </div>
    </article>
  );
}
