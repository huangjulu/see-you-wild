"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import React from "react";

import { cn } from "@/lib/utils";

interface DrawerRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
  children: React.ReactNode;
}

const DrawerRoot = (props: DrawerRootProps) => {
  function onOpenChange(open: boolean) {
    props.onOpenChange?.(open);
  }

  return (
    <DrawerPrimitive.Root open={props.open} onOpenChange={onOpenChange}>
      {props.children}
    </DrawerPrimitive.Root>
  );
};

DrawerRoot.displayName = "DrawerRoot";

interface DrawerTriggerProps extends React.ComponentProps<"button"> {}

const DrawerTrigger = (props: DrawerTriggerProps) => {
  const { className, ...restProps } = props;
  return <DrawerPrimitive.Trigger className={className} {...restProps} />;
};

DrawerTrigger.displayName = "DrawerTrigger";

interface DrawerContentProps {
  className?: string;
  children: React.ReactNode;
}

const DrawerContent = (props: DrawerContentProps) => {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop className="fixed inset-0 z-110 bg-black/40 transition-opacity duration-300 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-110 flex items-end">
        <DrawerPrimitive.Popup
          className={cn(
            "flex w-full flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] outline-none",
            "transition-transform duration-300 ease-out data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
            props.className
          )}
        >
          <div className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-neutral-200" />
          {props.children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
};

DrawerContent.displayName = "DrawerContent";

const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
});

Drawer.displayName = "Drawer";
export default Drawer;
