"use client";

import Image from "next/image";
import { useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { SukaKrsAgentModal } from "./suka-krs-agent-modal";

export function SukaKrsAgent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed right-5 bottom-5 z-50">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label="Open SUKA KRS Agent"
                onClick={() => setOpen(true)}
                className="
                  relative size-14 overflow-hidden rounded-full
                  bg-white p-1.5
                  shadow-lg shadow-black/15
                  ring-1 ring-black/5
                  transition-all duration-200
                  hover:scale-105 hover:shadow-xl
                  active:scale-95
                "
              >
                <Image
                  src="/ai-logo.png"
                  alt="SUKA KRS Agent"
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </button>
            }
          />

          <TooltipContent side="left">
            <p className="text-sm">SUKA KRS Agent</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <SukaKrsAgentModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
