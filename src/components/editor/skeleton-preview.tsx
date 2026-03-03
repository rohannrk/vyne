"use client"

import { useEffect } from "react";
import { useDialKit } from "dialkit";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComponentProps } from "@/types";
import { useEditorStore } from "@/store/editor-store";

export function SkeletonPreview() {
  const baseline = useEditorStore((s) => s.baselineProps);
  const setCurrentProps = useEditorStore((s) => s.setCurrentProps);

  const dials = useDialKit("Skeleton", {
    variant: baseline?.variant ?? "default",
    size: baseline?.size ?? "default",
    shape: baseline?.shape ?? "rounded",
    label: baseline?.label ?? "Loading card",
    disabled: baseline?.disabled ?? false,
    isLoading: baseline?.isLoading ?? true,
    borderRadius: [baseline?.borderRadius ?? 8, 0, 48],
    paddingX: [baseline?.paddingX ?? 0, 0, 0],
    paddingY: [baseline?.paddingY ?? 0, 0, 0],
    gap: [baseline?.gap ?? 8, 0, 32],
    fontSize: [baseline?.fontSize ?? 14, 10, 24],
    fontWeight: baseline?.fontWeight ?? "400",
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
    <div className="flex w-full max-w-md flex-col gap-3">
      <Skeleton
        className="h-4 w-24"
        style={{
          borderRadius: dials.borderRadius,
          opacity: dials.opacity / 100,
        }}
      />
      <Skeleton
        className="h-24 w-full"
        style={{
          borderRadius: dials.borderRadius,
          opacity: dials.opacity / 100,
          boxShadow:
            dials.shadow > 0
              ? `0 ${dials.shadow}px ${dials.shadow * 4}px rgba(0,0,0,0.12)`
              : "none",
        }}
      />
    </div>
  );
}
