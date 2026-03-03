"use client"

import { useEffect } from "react";
import { useDialKit } from "dialkit";
import { Textarea } from "@/components/ui/textarea";
import type { ComponentProps } from "@/types";
import { useEditorStore } from "@/store/editor-store";

export function TextareaPreview() {
  const baseline = useEditorStore((s) => s.baselineProps);
  const setCurrentProps = useEditorStore((s) => s.setCurrentProps);

  const dials = useDialKit("Textarea", {
    variant: baseline?.variant ?? "default",
    size: baseline?.size ?? "default",
    shape: baseline?.shape ?? "rounded",
    label: baseline?.label ?? "Textarea label",
    disabled: baseline?.disabled ?? false,
    isLoading: baseline?.isLoading ?? false,
    borderRadius: [baseline?.borderRadius ?? 8, 0, 48],
    paddingX: [baseline?.paddingX ?? 16, 0, 64],
    paddingY: [baseline?.paddingY ?? 8, 0, 32],
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
    <div className="flex w-full max-w-md flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground">
        {dials.label}
      </label>
      <Textarea
        disabled={dials.disabled}
        placeholder="Write something…"
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
      />
    </div>
  );
}
