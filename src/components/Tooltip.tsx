import { type ReactElement, cloneElement, useRef, useState } from "react";
import {
  FloatingPortal,
  arrow,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";
import { getSide } from "@floating-ui/utils";
import { AnimatePresence, motion } from "motion/react";

interface TooltipProps {
  content: string;
  children: ReactElement;
  placement?: Placement;
  delay?: number;
}

export function Tooltip({ content, children, placement = "top", delay = 180 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(10),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover    = useHover(context, { delay: { open: delay, close: 0 } });
  const focus    = useFocus(context);
  const dismiss  = useDismiss(context);
  const role     = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const side = getSide(context.placement);
  const staticSide = ({ top: "bottom", right: "left", bottom: "top", left: "right" } as const)[side];
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: refs.setReference, ...children.props }))}
      <FloatingPortal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.1 }}
              className="z-[9999] px-5 py-2 bg-sb-house text-white text-[1.1rem] font-black uppercase tracking-widest rounded-full shadow-2xl pointer-events-none whitespace-nowrap"
              {...getFloatingProps()}
            >
              {content}
              <div
                ref={arrowRef}
                className="absolute w-2 h-2 bg-sb-house rotate-45"
                style={{
                  left:  arrowX != null ? `${arrowX}px` : "",
                  top:   arrowY != null ? `${arrowY}px` : "",
                  [staticSide]: "-4px",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}
