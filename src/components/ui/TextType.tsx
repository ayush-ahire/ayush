"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

type TextTypeProps = {
  /** One string, or several typed in order when `loop` is on. */
  text: string | string[];
  /** Milliseconds between each character typed. */
  speed?: number;
  /** Pause between finishing one string and starting the next. */
  loopDelay?: number;
  /** Restart from the first string after the last one completes. */
  loop?: boolean;
  /** Fired once the full sequence completes, or on each cycle when looping. */
  onLoopComplete?: () => void;
  /** Wait until the element scrolls into view before typing. */
  startOnVisible?: boolean;
  /** Render the caret at the end of the line. */
  showCursor?: boolean;
  /** Extra classes for the caret. */
  cursorClassName?: string;
  className?: string;
};

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Subscribe to the reduced-motion media query.
 *
 * `useSyncExternalStore` rather than a `matchMedia` read inside an effect: it
 * reports the current value during the first client render instead of one
 * render later, so a visitor who has asked for reduced motion never sees a
 * frame of the typing begin. The server snapshot is `false`, matching what the
 * server rendered.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia(REDUCE_MOTION);
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(REDUCE_MOTION).matches,
    () => false,
  );
}

/**
 * Text type: reveals a string character by character, and when given an array,
 * clears the line and moves on to the next.
 *
 * Ported from reactbits' Text Type, with three deliberate differences:
 *
 * 1. Reduced motion is honoured in JS. `globals.css` already neutralises CSS
 *    animations for those visitors, but that cannot stop a JS timer from
 *    revealing characters over time, so the text is derived in full at render
 *    and the timer never starts.
 *
 * 2. The full string is always in the DOM as visually-hidden text, while the
 *    animating copy is hidden from assistive tech. Typing starts from an empty
 *    string, which would otherwise ship an empty `<h1>`: the search engines and
 *    link unfurlers that read the HTML without running JS would see no name.
 *
 * 3. Changing the text restarts the sequence by remounting the component that
 *    owns the typing state. Watching `text` in an effect and resetting
 *    afterwards would paint the stale string once more and cascade a second
 *    render.
 */
export function TextType(props: TextTypeProps) {
  /*
   * Keyed on what the text says rather than on `text`'s identity. A caller
   * passing `text={[a, b]}` inline builds a fresh array on every render, which
   * would otherwise reset the sequence each time.
   */
  const signature = Array.isArray(props.text) ? props.text.join("") : props.text;

  return <TextTypeSequence key={signature} {...props} />;
}

function TextTypeSequence({
  text,
  speed = 60,
  loopDelay = 600,
  loop = false,
  onLoopComplete,
  startOnVisible = true,
  showCursor = true,
  cursorClassName = "text-type-caret",
  className = "",
}: TextTypeProps) {
  const strings = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const reduceMotion = usePrefersReducedMotion();
  const instant = reduceMotion || speed <= 0;

  const containerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLoopCompleteRef = useRef(onLoopComplete);
  const announcedRef = useRef(false);

  const [started, setStarted] = useState(!startOnVisible);
  const [typed, setTyped] = useState({ index: 0, length: 0 });

  const { index, length } = typed;

  // Held in a ref so a new callback identity on re-render cannot restart typing.
  useEffect(() => {
    onLoopCompleteRef.current = onLoopComplete;
  }, [onLoopComplete]);

  /*
   * Start typing once the element is on screen. An already-visible element is
   * reported by the observer on its first callback, so the common case of the
   * hero sitting above the fold needs no extra timing.
   */
  useEffect(() => {
    if (!startOnVisible) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      // A margin so typing begins as the line enters view rather than only once
      // it is fully on screen.
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    // Nothing to schedule when the text already shows in full, or before the
    // element has been seen. The guard also keeps `strings.length` below from
    // being a modulo by zero.
    if (instant || !started || strings.length === 0) return;

    const current = strings[index % strings.length] ?? "";

    if (length < current.length) {
      timerRef.current = setTimeout(
        () => setTyped((prev) => ({ ...prev, length: prev.length + 1 })),
        speed,
      );
      return;
    }

    if (index < strings.length - 1) {
      timerRef.current = setTimeout(
        () => setTyped((prev) => ({ ...prev, index: prev.index + 1, length: 0 })),
        loopDelay,
      );
      return;
    }

    if (!loop) return;

    timerRef.current = setTimeout(() => {
      setTyped((prev) => ({ ...prev, index: 0, length: 0 }));
      // Each pass round the loop counts as a fresh completion.
      announcedRef.current = false;
    }, loopDelay);
  }, [instant, started, strings, index, length, speed, loop, loopDelay]);

  useEffect(() => {
    if (instant || !started || strings.length === 0) return;

    // Fires once per finished sequence only: the effect above re-runs on every
    // character, so a completed line would otherwise announce itself on each
    // render it happened to sit still for.
    if (announcedRef.current) return;

    const current = strings[index % strings.length] ?? "";
    if (length < current.length || index < strings.length - 1) return;

    announcedRef.current = true;
    onLoopCompleteRef.current?.();
  }, [instant, started, strings, index, length]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /*
   * In instant mode the last string is shown in full and no state changes, so
   * there is nothing for the effect above to advance.
   */
  const shownIndex = instant ? Math.max(strings.length - 1, 0) : index;
  const current = strings[shownIndex] ?? "";
  const shownLength = instant ? current.length : Math.min(length, current.length);

  /*
   * The caret is only shown while there is still something left to reveal, so a
   * finished line goes still instead of blinking indefinitely. In instant mode
   * the text never animates at all, so there is nothing to indicate.
   */
  const finished = length >= current.length && index === strings.length - 1;
  const caretVisible = showCursor && !instant && !finished;

  /*
   * With looping on, the finished line is cleared before the next begins, so the
   * accessible copy is the whole sequence rather than whatever happens to be on
   * screen at this instant.
   */
  const label = strings.join(". ");

  return (
    <span ref={containerRef} className={className}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {current.slice(0, shownLength)}
        {caretVisible && (
          <span
            className={`inline-block h-[1em] w-px translate-y-[0.125em] bg-current align-middle ${cursorClassName}`}
          />
        )}
      </span>
    </span>
  );
}
