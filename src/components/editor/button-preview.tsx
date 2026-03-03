"use client"

import { useEffect } from "react";
import { useDialKit } from "dialkit";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "@/types";
import { useEditorStore } from "@/store/editor-store";

export function ButtonPreview() {
  const baseline = useEditorStore((s) => s.baselineProps);
  const setCurrentProps = useEditorStore((s) => s.setCurrentProps);

  const dials = useDialKit("Button", {
    // Code props
    variant: baseline?.variant ?? "default",
    size: baseline?.size ?? "default",
    shape: baseline?.shape ?? "rounded",
    label: baseline?.label ?? "Button",
    disabled: baseline?.disabled ?? false,
    isLoading: baseline?.isLoading ?? false,
    // Design tokens
    borderRadius: [baseline?.borderRadius ?? 8, 0, 48],
    paddingX: [baseline?.paddingX ?? 16, 0, 64],
    paddingY: [baseline?.paddingY ?? 8, 0, 32],
    gap: [baseline?.gap ?? 8, 0, 32],
    fontSize: [baseline?.fontSize ?? 14, 10, 24],
    fontWeight: baseline?.fontWeight ?? "500",
    letterSpacing: [baseline?.letterSpacing ?? 0, -2, 4],
    opacity: [(baseline?.opacity ?? 1) * 100, 0, 100],
    shadow: [baseline?.shadow ?? 2, 0, 10],
  });

  useEffect(() => {
    const current: ComponentProps = {
      variant: dials.variant,
      size: dials.size,
      shape: dials.shape,
      label: dials.label,
      disabled: dials.disabled,
      isLoading: dials.isLoading,
      borderRadius: dials.borderRadius,
      paddingX: dials.paddingX,
      paddingY: dials.paddingY,
      gap: dials.gap,
      fontSize: dials.fontSize,
      fontWeight: dials.fontWeight,
      letterSpacing: dials.letterSpacing,
      opacity: dials.opacity / 100,
      shadow: dials.shadow,
    };
    setCurrentProps(current);
  }, [dials, setCurrentProps]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        disabled={dials.disabled}
        className="inline-flex items-center justify-center"
        variant={dials.variant as never}
        size={dials.size as never}
        style={{
          borderRadius: dials.borderRadius,
          paddingLeft: dials.paddingX,
          paddingRight: dials.paddingX,
          paddingTop: dials.paddingY,
          paddingBottom: dials.paddingY,
          fontSize: dials.fontSize,
          letterSpacing: dials.letterSpacing / 100,
          opacity: dials.opacity / 100,
          boxShadow:
            dials.shadow > 0
              ? `0 ${dials.shadow}px ${dials.shadow * 4}px rgba(0,0,0,0.12)`
              : "none",
          gap: dials.gap,
        }}
      >
        {dials.isLoading ? "Loading…" : dials.label}
      </Button>
    </div>
  );
}
