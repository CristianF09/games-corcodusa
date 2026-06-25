import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primary — orange #FF6B00, elevated shadow */
        default:
          "bg-primary text-primary-foreground rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,.10),0px_8px_10px_-6px_rgba(0,0,0,.10)] hover:bg-[#E55A00] hover:shadow-[0px_25px_30px_-5px_rgba(0,0,0,.15)] active:bg-[#CC4D00] disabled:bg-[#C9B2A5] disabled:text-white/50",
        /* Secondary — transparent with white 4px border, for use on dark backgrounds */
        secondary:
          "bg-transparent text-white border-4 border-white rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,.10),0px_8px_10px_-6px_rgba(0,0,0,.10)] hover:bg-white/15 active:bg-white/25 disabled:border-white/50 disabled:text-white/50",
        /* Outline — standard bordered, adapts to context */
        outline:
          "bg-transparent border-2 border-border text-foreground rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 active:bg-primary/10",
        /* Tertiary — yellow #FFD700 */
        tertiary:
          "bg-[#FFD700] text-[#1F2937] rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,.10),0px_8px_10px_-6px_rgba(0,0,0,.10)] hover:bg-[#F0C800] active:bg-[#E6BA00] disabled:bg-[#D9D0B5] disabled:text-[#1F2937]/50",
        /* Ghost — text only, hover orange */
        ghost:
          "bg-transparent text-foreground rounded-lg hover:text-primary hover:bg-primary/5 active:text-[#E55A00] active:bg-primary/10 disabled:text-muted-foreground",
        /* Destructive */
        destructive:
          "bg-destructive text-destructive-foreground rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,.10)] hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        /* sm — 32px height, 8px h-padding */
        sm:      "h-8 px-3 text-sm rounded-sm",
        /* default — 44px height, standard touch target */
        default: "h-11 px-6 text-base",
        /* lg — 60px height, 32px h-padding per design spec */
        lg:      "h-[60px] px-8 text-lg",
        /* icon */
        icon:    "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
