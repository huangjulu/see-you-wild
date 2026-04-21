import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { useTween } from "./useTween";
export { useTimeline } from "./useTimeline";

// TODO(共用邏輯整理): ScrollTrigger 直出供消費端呼叫 refresh()／其他 static API。
// 目前 Opening onComplete 解鎖 scroll 後需要 ScrollTrigger.refresh() 重算位置。
// 未來整理時可考慮改為 helper function（e.g. refreshScrollTriggers()）不直接暴露 ScrollTrigger。
export { ScrollTrigger };
