import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { useTimeline } from "./useTimeline";
export { useTween } from "./useTween";

// TODO(共用邏輯整理): ScrollTrigger 直出供消費端呼叫 refresh()／其他 static API。
// 目前 Opening onComplete 解鎖 scroll 後需要 ScrollTrigger.refresh() 重算位置。
// 未來整理時可考慮改為 helper function（e.g. refreshScrollTriggers()）不直接暴露 ScrollTrigger。
export { ScrollTrigger };
