import { createContext, useContext } from "react";

const ReducedMotionContext = createContext(false);

function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}

export { ReducedMotionContext, useReducedMotion };
