"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `
        peer
        w-5 h-5                 /* 20px x 20px */
        shrink-0
        rounded-[6px]
        border
        border-neutral-300
        bg-white

        transition-colors
        outline-none

        data-[state=checked]:bg-primary-100
        data-[state=checked]:border-neutral-100

        focus-visible:ring-2
        focus-visible:ring-neutral-300
        focus-visible:ring-offset-2

        disabled:cursor-not-allowed
        disabled:opacity-50
        `,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="
        
          flex items-center justify-center
          text-white               /* check icon putih */
        "
      >
        <CheckIcon className="w-3.5 h-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
