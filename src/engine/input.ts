/** Default binds: WASD move, mouse look, E interact, hold Q scan, hold RMB or F tether. */

export class Input {
  readonly keys = new Set<string>();
  mouseDX = 0;
  mouseDY = 0;
  lookArmed = false;
  pointerLocked = false;
  interactPressed = false;
  interactHeld = false;
  lensHeld = false;
  lensReleased = false;
  lensPressed = false;
  tetherHeld = false;
  tetherPressed = false;
  tetherReleased = false;
  wheel = 0;
  cyclePressed = false;
  holdAlternatives = false;
  /** On-screen stick, camera-relative, same as WASD. */
  padX = 0;
  padZ = 0;
  lookPadX = 0;
  lookPadY = 0;
  private canvas: HTMLCanvasElement;
  private tetherToggle = false;
  private dragLook = false;
  private downX = 0;
  private downY = 0;
  private downAt = 0;
  private interactBuf = 0;
  private tetherBuf = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    document.addEventListener("pointerlockchange", this.onLock);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("pointerlockchange", this.onLock);
  }

  beginFrame(): void {
    this.interactPressed = false;
    this.lensReleased = false;
    this.lensPressed = false;
    this.tetherPressed = false;
    this.tetherReleased = false;
    this.cyclePressed = false;
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.wheel = 0;
  }

  tickBuffer(dt: number): void {
    this.interactBuf = Math.max(0, this.interactBuf - dt);
    this.tetherBuf = Math.max(0, this.tetherBuf - dt);
    if (this.interactBuf > 0) this.interactPressed = true;
    if (this.tetherBuf > 0) this.tetherPressed = true;
  }

  consumeInteract(): boolean {
    if (this.interactPressed || this.interactBuf > 0) {
      this.interactPressed = false;
      this.interactBuf = 0;
      return true;
    }
    return false;
  }

  consumeTether(): boolean {
    if (this.tetherPressed || this.tetherBuf > 0) {
      this.tetherPressed = false;
      this.tetherBuf = 0;
      return true;
    }
    return false;
  }

  clearHeld(): void {
    this.keys.clear();
    this.lensHeld = false;
    this.interactHeld = false;
    if (!this.holdAlternatives) this.tetherHeld = false;
    this.dragLook = false;
    this.lookArmed = false;
    this.padX = 0;
    this.padZ = 0;
    this.lookPadX = 0;
    this.lookPadY = 0;
  }

  requestLook(): void {
    // P0: never lock the pointer. Look is hold-left-drag only.
  }

  releaseLook(): void {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
    this.lookArmed = false;
    this.dragLook = false;
  }

  axis(): { x: number; z: number } {
    let x = this.padX;
    let z = this.padZ;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) z -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) z += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) x -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) x += 1;
    const len = Math.hypot(x, z);
    if (len > 0) {
      x /= len;
      z /= len;
    }
    return { x, z };
  }

  tapInteract(): void {
    this.interactPressed = true;
    this.interactHeld = true;
    this.interactBuf = 0.16;
  }

  holdInteract(on: boolean): void {
    this.interactHeld = on;
    if (on) {
      this.interactPressed = true;
      this.interactBuf = 0.16;
    }
  }

  holdLens(on: boolean): void {
    if (on) {
      if (!this.lensHeld) this.lensPressed = true;
      this.lensHeld = true;
      return;
    }
    if (this.lensHeld) this.lensReleased = true;
    this.lensHeld = false;
  }

  holdPadTether(on: boolean): void {
    if (on) this.pressTether(true);
    else this.releaseTetherKey();
  }

  private typing(event: Event): boolean {
    const target = event.target;
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat || this.typing(event)) return;
    this.keys.add(event.code);
    if (event.code === "KeyE") {
      this.interactPressed = true;
      this.interactHeld = true;
      this.interactBuf = 0.16;
    }
    if (event.code === "KeyQ") {
      this.lensHeld = true;
      this.lensPressed = true;
    }
    if (event.code === "KeyF") {
      this.pressTether(true);
      this.tetherBuf = 0.16;
    }
    if (event.code === "Tab") {
      event.preventDefault();
      this.cyclePressed = true;
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
    if (event.code === "KeyE") this.interactHeld = false;
    if (event.code === "KeyQ") {
      this.lensHeld = false;
      this.lensReleased = true;
    }
    if (event.code === "KeyF") this.releaseTetherKey();
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (this.pointerLocked || this.lookArmed || this.dragLook) {
      this.mouseDX += event.movementX;
      this.mouseDY += event.movementY;
    }
  };

  private onMouseDown = (event: MouseEvent): void => {
    if (event.button === 0) {
      this.downX = event.clientX;
      this.downY = event.clientY;
      this.downAt = performance.now();
      if (!this.pointerLocked && event.target === this.canvas) {
        this.dragLook = true;
        this.lookArmed = true;
      }
    }
    if (event.button === 2) this.pressTether(false);
  };

  private onMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) {
      const dx = event.clientX - this.downX;
      const dy = event.clientY - this.downY;
      const brief = performance.now() - this.downAt < 280;
      const still = dx * dx + dy * dy < 64;
      this.dragLook = false;
      if (!this.pointerLocked) this.lookArmed = false;
      if (brief && still && event.target === this.canvas) this.tapInteract();
    }
    if (event.button === 2) {
      this.tetherHeld = false;
      this.tetherReleased = true;
    }
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.wheel += event.deltaY > 0 ? 1 : -1;
  };

  private onLock = (): void => {
    this.pointerLocked = document.pointerLockElement === this.canvas;
    if (!this.pointerLocked) this.lookArmed = this.dragLook;
  };

  private pressTether(allowToggle: boolean): void {
    if (allowToggle && this.holdAlternatives) {
      this.tetherToggle = !this.tetherToggle;
      this.tetherHeld = this.tetherToggle;
      if (this.tetherToggle) this.tetherPressed = true;
      else this.tetherReleased = true;
      return;
    }
    this.tetherHeld = true;
    this.tetherPressed = true;
  }

  private releaseTetherKey(): void {
    if (this.holdAlternatives) return;
    this.tetherHeld = false;
    this.tetherReleased = true;
  }
}
