"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import React from "react";

export function SubmitButton({ children, loadingText = "Submitting...", ...props }: React.ComponentProps<typeof Button> & { loadingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending ? loadingText : children}
    </Button>
  );
}
