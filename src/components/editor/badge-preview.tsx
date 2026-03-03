"use client"

import { useEffect } from "react";
import { useDialKit } from "dialkit";
import { Badge } from "@/components/ui/badge";
import type { ComponentProps } from "@/types";
import { useEditorStore } from "@/store/editor-store";

export function BadgePreview() {
  const baseline = useEditorStore((s) => s.baselineProps);
  const setCurrentProps = useEditorStore((s) => s.setCurrentProps);

  const dials = useDialKit("Badge", {
    variant: baseline?.variant ?? "default",
    size: baseline?.size ?? "default",
    shape: baseline?.shape ?? "pill",
    label: baseline?.label ?? "Badge",
    disabled: baseline?.disabled ?? false,
    isLoading: baseline?.isLoading ?? false,
    borderRadius: [baseline?.borderRadius ?? 999, 0, 999],
    paddingX: [baseline?.paddingX ?? 12, 4, 32],
    paddingY: [baseline?.paddingY ?? 4, 0, 16],
    gap: [baseline?.gap ?? 8, 0, 32],
    fontSize: [baseline?.fontSize ?? 12, 10, 20],
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
    <Badge
      variant={dials.variant as "default" | "secondary" | "destructive" | "outline"}
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
      }}
    >
      {dials.label}
    </Badge>
  );
}
