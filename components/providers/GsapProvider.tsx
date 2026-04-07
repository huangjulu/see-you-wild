"use client";

import "@/lib/gsap";

interface GsapProviderProps {
  children: React.ReactNode;
}

const GsapProvider: React.FC<GsapProviderProps> = (props) => {
  return <>{props.children}</>;
};

GsapProvider.displayName = "GsapProvider";
export default GsapProvider;
