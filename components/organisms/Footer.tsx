import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 text-center border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-4">
        <p className="font-serif text-lg font-semibold">{SITE_NAME}</p>
        <hr className="border-white/20 max-w-xs mx-auto" aria-hidden="true" />
        <p className="text-sm text-white/50">
          &copy; {year} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
