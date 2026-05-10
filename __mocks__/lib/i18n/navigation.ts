import React from "react";

export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function Link(props, ref) {
  return React.createElement("a", { ...props, ref });
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
