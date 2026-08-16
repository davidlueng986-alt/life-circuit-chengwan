import type { Input } from "./input";

/** Always-on on-screen controls so touch, trackpads, and browser QA can walk. */
export function bindTouchPad(input: Input): void {
  const root = document.querySelector("#touch-pad");
  if (!(root instanceof HTMLElement)) return;

  const hold = (el: Element | null, onDown: () => void, onUp: () => void): void => {
    if (!(el instanceof HTMLElement)) return;
    const down = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      el.setPointerCapture(event.pointerId);
      el.dataset["on"] = "1";
      onDown();
    };
    const up = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      el.dataset["on"] = "0";
      onUp();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", (event) => {
      if (el.dataset["on"] === "1") up(event as PointerEvent);
    });
  };

  hold(root.querySelector("[data-move='w']"), () => (input.padZ = -1), () => (input.padZ = input.padZ < 0 ? 0 : input.padZ));
  hold(root.querySelector("[data-move='s']"), () => (input.padZ = 1), () => (input.padZ = input.padZ > 0 ? 0 : input.padZ));
  hold(root.querySelector("[data-move='a']"), () => (input.padX = -1), () => (input.padX = input.padX < 0 ? 0 : input.padX));
  hold(root.querySelector("[data-move='d']"), () => (input.padX = 1), () => (input.padX = input.padX > 0 ? 0 : input.padX));
  hold(root.querySelector("[data-look='left']"), () => (input.lookPadX = -1), () => (input.lookPadX = 0));
  hold(root.querySelector("[data-look='right']"), () => (input.lookPadX = 1), () => (input.lookPadX = 0));
  hold(root.querySelector("[data-look='up']"), () => (input.lookPadY = -1), () => (input.lookPadY = 0));
  hold(root.querySelector("[data-look='down']"), () => (input.lookPadY = 1), () => (input.lookPadY = 0));
  hold(
    root.querySelector("[data-act='e']"),
    () => input.holdInteract(true),
    () => input.holdInteract(false),
  );
  hold(
    root.querySelector("[data-act='q']"),
    () => input.holdLens(true),
    () => input.holdLens(false),
  );
  hold(
    root.querySelector("[data-act='f']"),
    () => input.holdPadTether(true),
    () => input.holdPadTether(false),
  );

  const go = root.querySelector("[data-act='go']");
  if (go instanceof HTMLElement) {
    go.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      input.padZ = -1;
      go.dataset["on"] = "1";
      window.setTimeout(() => {
        if (input.padZ < 0) input.padZ = 0;
        go.dataset["on"] = "0";
      }, 1400);
    });
  }
}
