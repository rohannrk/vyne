"use client"

import { useEffect } from "react";
import { useDialKit } from "dialkit";
import { Progress } from "@/components/ui/progress";
import type { ComponentProps } from "@/types";
import { useEditorStore } from "@/store/editor-store";

export function ProgressPreview() {
  const baseline = useEditorStore((s) => s.baselineProps);
  const setCurrentProps = useEditorStore((s) => s.setCurrentProps);

  const dials = useDialKit("Progress", {
    variant: baseline?.variant ?? "default",
    size: baseline?.size ?? "default",
    shape: baseline?.shape ?? "rounded",
    label: baseline?.label ?? "Uploading",
    disabled: baseline?.disabled ?? false,
    isLoading: baseline?.isLoading ?? false,
    borderRadius: [baseline?.borderRadius ?? 999, 0, 999],
    paddingX: [baseline?.paddingX ?? 0, 0, 0],
    paddingY: [baseline?.paddingY ?? 0, 0, 0],
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
    <div className="flex w-full max-w-md flex-col gap-2">
      <div
        className="flex items-center justify-between text-xs font-medium text-muted-foreground"
        style={{
          fontSize: dials.fontSize,
          letterSpacing: dials.letterSpacing / 100,
        }}
      >
        <span>{dials.label}</span>
        <span>64%</span>
      </div>
      <Progress
        value={64}
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
