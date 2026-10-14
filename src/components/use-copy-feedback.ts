import { useCallback, useEffect, useRef, useState } from "react";

/** How long "Copied" stays up — long enough to read, short enough to copy again. */
const COPIED_FEEDBACK_MS = 1_500;

/**
 * Copy text to the clipboard and say so for a moment. `copy` resolves to false when
 * the clipboard refused (permissions, insecure context), so callers can fall back.
 */
export function useCopyFeedback() {
  const [hasCopied, setHasCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    setHasCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setHasCopied(false);
    }, COPIED_FEEDBACK_MS);
    return true;
  }, []);

  return { hasCopied, copy };
}
