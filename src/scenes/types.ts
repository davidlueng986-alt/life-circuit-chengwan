import type * as THREE from "three";
import type { SceneId } from "../content/ids";
import type { SaveState } from "../content/saveTypes";
import type { CameraRig } from "../engine/cameraRig";
import type { WorldColliders } from "../engine/collision";
import type { Input } from "../engine/input";
import type { InteractSystem } from "../engine/interact";
import type { PlayerMotor } from "../engine/player";
import type { BioRig } from "../engine/systems/bioRig";
import type { DockSystem } from "../engine/systems/docks";
import type { FlowLens } from "../engine/systems/flowLens";
import type { SignalGraph } from "../engine/systems/signalGraph";
import type { TetherTool } from "../engine/systems/tether";
import type { Triangulation } from "../engine/systems/triangulation";
import type { Hud } from "../ui/hud";
import type { Workbench } from "../ui/workbench";

export interface SceneContext {
  three: THREE.Scene;
  root: THREE.Group;
  world: WorldColliders;
  player: PlayerMotor;
  camera: CameraRig;
  input: Input;
  interact: InteractSystem;
  hud: Hud;
  workbench: Workbench;
  save: SaveState;
  persist: () => void;
  completeAndGo: () => void;
  loadScene: (id: SceneId) => void;
  say: (id: string) => void;
  queueLines: (ids: string[]) => void;
  signals: SignalGraph;
  flowLens: FlowLens;
  tether: TetherTool;
  bioRig: BioRig;
  docks: DockSystem;
  triangulation: Triangulation;
  reducedMotion: boolean;
  now: number;
  suggestRelaxed: () => void;
}

export interface GameScene {
  readonly id: SceneId;
  mount(ctx: SceneContext): void;
  update(dt: number, ctx: SceneContext): void;
  unmount(): void;
}
