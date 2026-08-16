import { Game } from "./engine/game";

function hasWebGL(): boolean {
  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
  return gl !== null;
}

function boot(): void {
  const canvas = document.querySelector("#world");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("missing #world");
  }
  if (!hasWebGL()) {
    const dialog = document.querySelector("#webgl-fail");
    if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
    return;
  }
  const game = new Game(canvas);
  game.start();
}

boot();
