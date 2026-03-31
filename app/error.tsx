"use client";

import { useEffect } from "react";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ChunkLoadError: auto-reload to fetch new chunks after deployment
    if (error.name === "ChunkLoadError") {
      window.location.reload();
    }
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
      <Heading level="h1" className="text-6xl font-bold mb-4">
        Oops
      </Heading>
      <Text muted className="text-xl mb-8">
        發生了一點問題
      </Text>
      <button
        onClick={reset}
        className="inline-block px-8 py-3 rounded-full text-sm font-sans font-medium tracking-widest uppercase border border-white/60 text-white hover:bg-white/10 hover:border-white transition-all duration-300"
      >
        重新嘗試
      </button>
    </main>
  );
}
