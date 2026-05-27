import { cn } from "@/lib/utils";

interface ListCardProps {
  image?: string | null;
  imageAlt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

const sizeConfig = {
  sm: {
    image: "size-14",
    padding: "p-3",
    gap: "gap-3",
    card: "rounded-xl",
    img: "rounded-md",
  },
  md: {
    image: "size-20",
    padding: "p-4",
    gap: "gap-4",
    card: "rounded-2xl",
    img: "rounded-lg",
  },
  lg: {
    image: "size-32",
    padding: "p-5",
    gap: "gap-5",
    card: "rounded-3xl",
    img: "rounded-xl",
  },
} as const;

const ListCard = (props: ListCardProps) => {
  const config = sizeConfig[props.size ?? "md"];

  return (
    <article
      className={cn(
        "flex border border-neutral-100 bg-white shadow-2xs transition-shadow duration-300 hover:shadow-lg",
        config.padding,
        config.gap,
        config.card,
        props.className
      )}
    >
      {props.image && (
        <img
          src={props.image}
          alt={props.imageAlt ?? ""}
          loading="lazy"
          decoding="async"
          className={cn("shrink-0 object-cover", config.img, config.image)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {props.children}
      </div>
    </article>
  );
};

ListCard.displayName = "ListCard";
export default ListCard;
