import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        `
        relative
        w-6 h-6 rounded-full               /* 24x24 */

        bg-white
        outline-none
        transition-colors
        flex items-center justify-center

        ring-inset ring-[1.6px] ring-neutral-400

        data-[state=checked]:bg-red-600
        data-[state=checked]:ring-0

        focus-visible:ring-2
        focus-visible:ring-red-600/30
        focus-visible:ring-offset-2

        disabled:cursor-not-allowed
        disabled:opacity-50
        `,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="w-[9.6px] h-[9.6px] rounded-full bg-white"
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
