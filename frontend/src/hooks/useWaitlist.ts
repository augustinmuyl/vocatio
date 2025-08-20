import { useState, useCallback } from "react";

export type WaitlistStatus = "idle" | "success" | "error";

export function useWaitlist() {
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submit = useCallback(async (payload: Record<string, unknown>) => {
    try {
      setStatus("idle");
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  return { submit, status, isSubmitted };
}

