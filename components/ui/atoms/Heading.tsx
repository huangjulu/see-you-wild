import { cn } from "@/lib/utils";

type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type Variant = "display" | "heading" | "sub-heading" | "ui";

const variantClass: Record<Variant, string> = {
  display: "typo-display text-4xl md:text-5xl text-primary",
  heading: "typo-heading text-primary",
  "sub-heading": "typo-sub-heading text-xl text-primary",
  ui: "typo-ui text-sm text-primary",
};

interface HeadingProps {
  level: Level;
  variant?: Variant;
  overline?: string;
  description?: string;
  overlineClassName?: string;
  descriptionClassName?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

function HeadingBase(props: HeadingProps) {
  const HeadingTag = props.level;
  const variant = props.variant ?? "heading";

  if (!props.overline && !props.description) {
    return (
      <HeadingTag
        id={props.id}
        className={cn(variantClass[variant], props.className)}
      >
        {props.children}
      </HeadingTag>
    );
  }

  return (
    <div className={props.className}>
      {props.overline && (
        <p
          className={cn(
            "typo-overline text-sm mb-2 text-brand-500",
            props.overlineClassName
          )}
        >
          {props.overline}
        </p>
      )}
      <HeadingTag
        id={props.id}
        className={cn(variantClass[variant], props.className)}
      >
        {props.children}
      </HeadingTag>
      {props.description && (
        <p
          className={cn(
            "typo-body mt-1 text-secondary",
            props.descriptionClassName
          )}
        >
          {props.description}
        </p>
      )}
    </div>
  );
}

type LevelProps = Omit<HeadingProps, "level">;

const H1: React.FC<LevelProps> = (props) => (
  <HeadingBase {...props} level="h1" />
);
const H2: React.FC<LevelProps> = (props) => (
  <HeadingBase {...props} level="h2" />
);
const H3: React.FC<LevelProps> = (props) => (
  <HeadingBase {...props} level="h3" />
);
const H4: React.FC<LevelProps> = (props) => (
  <HeadingBase {...props} level="h4" />
);
const H5: React.FC<LevelProps> = (props) => (
  <HeadingBase {...props} level="h5" />
);
const H6: React.FC<LevelProps> = (props) => (
  <HeadingBase {...props} level="h6" />
);

H1.displayName = "Heading.H1";
H2.displayName = "Heading.H2";
H3.displayName = "Heading.H3";
H4.displayName = "Heading.H4";
H5.displayName = "Heading.H5";
H6.displayName = "Heading.H6";

const Heading = Object.assign(HeadingBase, { H1, H2, H3, H4, H5, H6 });

export default Heading;
