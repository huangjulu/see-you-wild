"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSyncExternalStore } from "react";
import { ReducedMotionContext } from "@/stores/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const query =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribe(callback: () => void) {
  query?.addEventListener("change", callback);
  return () => {
    query?.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return query?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

interface GsapProviderProps {
  children: React.ReactNode;
}

const GsapProvider: React.FC<GsapProviderProps> = (props) => {
  const reduceMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return (
    <ReducedMotionContext value={reduceMotion}>
      {props.children}
    </ReducedMotionContext>
  );
};

GsapProvider.displayName = "GsapProvider";
export default GsapProvider;
