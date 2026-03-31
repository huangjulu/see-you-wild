import type { CommonDictionary } from "@/lib/i18n";

interface FooterProps {
  dict: CommonDictionary;
}

export default function Footer({ dict }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 text-center border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-4">
        <p className="font-serif text-lg font-semibold">{dict.siteName}</p>
        <hr className="border-white/20 max-w-xs mx-auto" aria-hidden="true" />
        <p className="text-sm text-white/50">
          &copy; {year} {dict.siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
