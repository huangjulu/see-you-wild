import { type AnchorHTMLAttributes, createElement, forwardRef } from "react";

export const Link = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function Link(props, ref) {
  return createElement("a", { ...props, ref });
});

Link.displayName = "Link";

export const redirect = () => {};
export const usePathname = () => "/";
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
});
export const getPathname = () => "/";
