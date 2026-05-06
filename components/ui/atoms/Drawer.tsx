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

const DrawerRoot: React.FC<DrawerRootProps> = (props) => {
  const dismissible = props.dismissible ?? true;

  function onOpenChange(open: boolean) {
    props.onOpenChange?.(open);
  }

  return (
    <DrawerPrimitive.Root open={props.open} onOpenChange={onOpenChange}>
      {props.children}
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop
          className="fixed inset-0 z-40 bg-black/40"
          onClick={dismissible ? undefined : (e) => e.stopPropagation()}
        />
        <DrawerPrimitive.Viewport className="fixed inset-0 z-40 flex items-end" />
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
};

DrawerRoot.displayName = "DrawerRoot";

interface DrawerTriggerProps extends React.ComponentProps<"button"> {}

const DrawerTrigger: React.FC<DrawerTriggerProps> = (props) => {
  const { className, ...restProps } = props;
  return <DrawerPrimitive.Trigger className={className} {...restProps} />;
};

DrawerTrigger.displayName = "DrawerTrigger";

interface DrawerContentProps {
  className?: string;
  children: React.ReactNode;
}

const DrawerContent: React.FC<DrawerContentProps> = (props) => {
  return (
    <DrawerPrimitive.Popup
      className={cn(
        "flex w-full flex-col rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] outline-none",
        props.className
      )}
    >
      <div className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-neutral-200" />
      {props.children}
    </DrawerPrimitive.Popup>
  );
};

DrawerContent.displayName = "DrawerContent";

const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
});

Drawer.displayName = "Drawer";
export default Drawer;
