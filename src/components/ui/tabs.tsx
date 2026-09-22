"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "cn";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex flex-col gap-0 data-vertical:flex-row data-vertical:gap-4", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit items-center rounded-t-[5px] bg-[#EAF4EA] text-sm font-sans text-[#005A00]", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-12 w-max items-center justify-center rounded-t-[5px] border-t-4 border-t-transparent bg-white/10 px-3 py-1.5 text-sm font-medium transition-colors outline-none",
        "hover:bg-white/30 cursor-pointer",
        "data-active:bg-white data-active:border-t-[#105E15] data-active:text-[#105E15]",
        "focus-visible:ring-2 focus-visible:ring-[#105E15]/30",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex flex-1 flex-col rounded-r-[5px] rounded-b-[5px] bg-white p-4 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
