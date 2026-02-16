"use client";
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Loader from "../spinner"
import { cn } from "@/lib/utilts"

const buttonVariants = cva(
  "cursor-pointer ripple inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-normal transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden relative",
  {
    variants: {
      variant: {
        default: "bg-brand-500 text-white hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-accent bg-transparent shadow-xs hover:bg-transparent dark:bg-input/30 dark:border dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-secondary hover:text-accent dark:hover:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-200"
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-10 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Ripple effect interface
interface Ripple {
  x: number
  y: number
  size: number
  id: number
}

// Ripple effect styles (to be added to your global CSS or CSS-in-JS)
const rippleStyles = `
@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
`

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  onClick,
  showSpinner = true,
  loading = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean,
    showSpinner?: boolean,
    loading?: boolean
  }) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Add the ripple styles to the document head
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleElement = document.createElement('style')
      styleElement.textContent = rippleStyles
      document.head.appendChild(styleElement)

      return () => {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple: Ripple = {
        x,
        y,
        size,
        id: Date.now()
      }

      setRipples(prevRipples => [...prevRipples, newRipple])

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prevRipples => prevRipples.filter(r => r.id !== newRipple.id))
      }, 600)
    }

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event)
    }
  }

  const Comp = "button"

  return (
    <Comp
      ref={buttonRef}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    >
      {/* {icon && !props.disabled && <span className="text-base">{icon}</span>} */}
      {loading && showSpinner && <Loader />}
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transform: 'scale(0)',
            animation: 'ripple-animation 0.6s linear',
            pointerEvents: 'none',
          }}
        />
      ))}
    </Comp>
  )
}

export { Button, buttonVariants }