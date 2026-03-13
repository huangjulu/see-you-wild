import Link from "next/link";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
      <Heading level="h1" className="text-6xl font-bold mb-4">
        404
      </Heading>
      <Text muted className="text-xl mb-8">
        找不到這個頁面
      </Text>
      <Link
        href="/"
        className="inline-block px-8 py-3 rounded-full text-sm font-sans font-medium tracking-widest uppercase border border-white/60 text-white hover:bg-white/10 hover:border-white transition-all duration-300"
      >
        回到首頁
      </Link>
    </main>
  );
}
