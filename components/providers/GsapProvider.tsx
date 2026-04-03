"use client";

import "@/lib/gsap";

interface GsapProviderProps {
  children: React.ReactNode;
}

function GsapProvider(props: GsapProviderProps) {
  return <>{props.children}</>;
}

GsapProvider.displayName = "GsapProvider";
export default GsapProvider;
