import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border-0 bg-black/30 px-3 py-1 text-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.08)] transition-[box-shadow,background-color] duration-150 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--text-faint)] hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.14)] focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(62,230,160,0.6),0_0_0_4px_rgba(62,230,160,0.14)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[0_0_0_1px_var(--coral),0_0_0_4px_rgba(255,122,107,0.15)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
