"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/button";

export function SubmitButton({ children, loadingText = "Submitting...", ...props }: ButtonProps & { loadingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending ? loadingText : children}
    </Button>
  );
}
