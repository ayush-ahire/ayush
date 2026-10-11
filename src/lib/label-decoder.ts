/**
 * Stratum-style label decoding.
 *
 * On hover, a label's characters resolve out of a scramble rather than simply
 * appearing — a small confirmation that the control is live, borrowed from the
 * reference site's label treatment.
 *
 * Two deliberate limits, both accessibility-driven:
 *
 * - **Hover only.** Nothing decodes on boot or on focus. A scramble triggered
 *   at page load would leave assistive tech reading random letters mid-
 *   animation, and focus-triggered decoding would fire constantly as a keyboard
 *   user tabs past every link.
 * - **Width is reserved first.** Each label is measured at its final text and
 *   pinned to that width before any decoding begins. Without it the surrounding
 *   links shuffle sideways on every animation frame.
 *
 * Because the decoder writes to `textContent`, it re-reads the source text on
 * every decode. That is what lets a label whose text changes — the nav's
 * MENU/CLOSE toggle — decode correctly instead of replaying its first value.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Every label resolves in the same time, however long it is. */
const DURATION = 400;

/** How often the trailing scramble re-rolls. */
const ROLL_INTERVAL = 45;

/** How many characters past the resolving front stay scrambled. */
const SCRAMBLE_TAIL = 3.6;

type Decoder = {
  frame: number;
  /** Absent once the animation has finished on its own. */
  timeout?: ReturnType<typeof setTimeout>;
};

/**
 * Keeps the resolved text for one label and its per-element animation state.
 *
 * The element is stored in a `WeakMap` rather than decorated with ad-hoc
 * `_raf`/`_t` properties so that a re-render which replaces the node can't
 * leave a stale animation writing into a detached element.
 */
export function createLabelDecoder(root?: ParentNode | null): () => void {
  const settle = (el: HTMLElement, text: string, state?: Decoder) => {
    if (state) {
      cancelAnimationFrame(state.frame);
      if (state.timeout) clearTimeout(state.timeout);
    }
    if (el.textContent !== text) el.textContent = text;
  };

  return function attach() {
    const scope = root ?? document;
    if (typeof window === "undefined") return () => {};

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return () => {};

    const cleanups: Array<() => void> = [];
    const states = new WeakMap<HTMLElement, Decoder>();

    // Labels are measured in one batch, then pinned, so no label is ever
    // decoded while it is still the width of its own placeholder.
    const labels = Array.from(scope.querySelectorAll<HTMLElement>(".lbl > .t"));

    const reserved = labels.map((el) => el.getBoundingClientRect().width);
    labels.forEach((el, i) => {
      const width = reserved[i];
      // A zero width means the label wasn't laid out yet; pinning that would
      // collapse it permanently, so leave it to size itself.
      if (width > 0) el.style.width = `${width}px`;
    });

    const decode = (el: HTMLElement) => {
      const text = el.dataset.text ?? el.textContent ?? "";
      el.dataset.text = text;

      const previous = states.get(el);
      if (previous) settle(el, text, previous);

      const length = text.length;
      const started = performance.now();
      let lastRoll = 0;

      const roll = () => {
        for (let i = 0; i < length; i++) {
          scramble[i] = GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
        }
      };
      const scramble = new Array<string>(length);
      roll();

      const step = (now: number) => {
        const progress = Math.min(1, (now - started) / DURATION);
        const front = progress * length;

        if (now - lastRoll > ROLL_INTERVAL) {
          roll();
          lastRoll = now;
        }

        let out = "";
        for (let i = 0; i < length; i++) {
          if (i < front) {
            out += text.charAt(i);
          } else if (i < front + SCRAMBLE_TAIL) {
            // Spaces stay spaces, so a label never appears to close up mid-scramble.
            const character = text.charAt(i);
            out += character === " " ? " " : scramble[i];
          } else {
            break;
          }
        }
        el.textContent = out;

        if (progress < 1) {
          states.set(el, { frame: requestAnimationFrame(step) });
        } else {
          states.delete(el);
          settle(el, text);
        }
      };

      // A tab that loses focus throttles rAF to roughly 1fps, which would leave
      // a label half-scrambled until focus returned. The timeout is the floor
      // that guarantees it always resolves.
      const state: Decoder = {
        frame: requestAnimationFrame(step),
        timeout: setTimeout(() => settle(el, text), DURATION + 250),
      };
      states.set(el, state);
    };

    const containers = Array.from(scope.querySelectorAll<HTMLElement>(".lbl"));
    for (const container of containers) {
      const target = container.querySelector<HTMLElement>(":scope > .t");
      if (!target) continue;

      const enter = () => decode(target);
      const leave = () => {
        const state = states.get(target);
        if (state) settle(target, target.dataset.text ?? "", state);
      };

      container.addEventListener("pointerenter", enter);
      container.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        container.removeEventListener("pointerenter", enter);
        container.removeEventListener("pointerleave", leave);
        leave();
        target.style.width = "";
      });
    }

    // A label that is still scrambled when the window is resized would keep a
    // width measured against the old layout.
    const onResize = () => cleanups.forEach((c) => c());
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cleanups.forEach((c) => c());
    };
  };
}