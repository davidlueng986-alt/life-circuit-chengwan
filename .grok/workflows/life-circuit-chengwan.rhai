// 《生命迴路：澄灣》P0 垂直切片多代理開發工作流
// 範圍：序章《黑水線》+ 可選微觀工作坊 + 第一章《紅色警報》
// 權威：新版 game-first 腳本；舊版製作包只作科學邊界參考
// 部署：Cloudflare Workers static assets（SPA）+ 本機 wrangler dev／dry-run
// 閘門：無 await_user／無條件 pause（缺 args 用預設路徑）
//
// 呼叫：
//   /life-circuit-chengwan
//   /workflow life-circuit-chengwan
//
// 可選 args：
//   repo_root     遊戲程式根目錄（預設 C:/Users/daive/life-circuit-chengwan）
//   script_txt    新腳本純文字（預設 Downloads 抽出檔）
//   legacy_docs   舊製作包（科學宣稱參考）
//   game_url      本機 QA URL（預設 http://127.0.0.1:8787）
//   focus         full | intake | science | design | scaffold | engine |
//                 build | integrate | cloudflare | local-test | verify | deploy
//                 或逗號分隔子集
//   locale        zh-Hant（預設）| both
//   deploy        false（預設，只本機＋dry-run）| true（whoami 成功才 live deploy）
//   resume_note   續跑備註

let meta = #{
    name: "life-circuit-chengwan",
    description: "Develop Life Circuit Chengwan P0 (Prologue + Workshop + Chapter 1) as a 3D game-first slice, test locally with Wrangler, and package for Cloudflare Workers",
    when_to_use: "When building or iterating the Chengwan vertical slice and you need a no-gate multi-agent pipeline that can wrangler-dev locally and deploy to Cloudflare",
    phases: [
        #{ title: "Intake", detail: "Resolve authority, scope contract, Cloudflare target" },
        #{ title: "Science", detail: "Claim maturity, education, safety boundaries" },
        #{ title: "Design", detail: "3D verbs, scenes, Fun Gate + Learning Gate" },
        #{ title: "Scaffold", detail: "Vite + Three.js + wrangler.jsonc repo" },
        #{ title: "Engine", detail: "Third-person, Flow Lens, Tether, dialogue, save" },
        #{ title: "Build", detail: "Parallel Prologue, Workshop, Chapter 1" },
        #{ title: "Integrate", detail: "Hub routing, loadout, shared state" },
        #{ title: "Cloudflare", detail: "Workers SPA assets, headers, build scripts" },
        #{ title: "LocalTest", detail: "wrangler dev + live playthrough" },
        #{ title: "Verify", detail: "Adversarial science, play, deploy readiness" },
        #{ title: "Deploy", detail: "dry-run always; live only if deploy=true" },
    ],
};

fn trimmed(s) {
    if type_of(s) == "string" {
        s.trim();
        s
    } else {
        ""
    }
}

fn as_str(v, fallback) {
    if v == () { return fallback; }
    if type_of(v) == "string" {
        let t = trimmed(v);
        if t == "" { return fallback; }
        return t;
    }
    fallback
}

fn as_bool(v, fallback) {
    let s = as_str(v, "");
    if s == "" { return fallback; }
    if s == "true" || s == "1" || s == "yes" { return true; }
    if s == "false" || s == "0" || s == "no" { return false; }
    fallback
}

fn contains_token(hay, needle) {
    let h = "," + hay + ",";
    let n = "," + needle + ",";
    let hl = h.len();
    let nl = n.len();
    if nl == 0 || nl > hl { return false; }
    let i = 0;
    while i + nl <= hl {
        if h.sub_string(i, nl) == n { return true; }
        i += 1;
    }
    false
}

fn wave_on(selected, name) {
    if selected == "all" || selected == "" || selected == "full" { return true; }
    if selected == name { return true; }
    if contains_token(selected, name) { return true; }
    false
}

fn agent_ok(r) {
    r != () && r.success
}

fn record_slot(wave_log, prefix, results) {
    let i = 0;
    let fails = 0;
    for r in results {
        if agent_ok(r) {
            wave_log.push(prefix + " " + i.to_string() + ": ok");
        } else {
            wave_log.push(prefix + " " + i.to_string() + ": FAILED");
            fails += 1;
        }
        i += 1;
    }
    fails
}

fn ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy) {
    let p = "";
    p += "You are an elite production agent on iGEM 2026 education game 生命迴路：澄灣 (Life Circuit: Chengwan).\n";
    p += "This is the 2026-08-15 GAME-FIRST rewrite. The game must play as a third-person 3D adventure first.\n";
    p += "REPO (edit only here): " + repo_root + "\n";
    p += "NEW SCRIPT AUTHORITY (read this first, thoroughly): " + script_txt + "\n";
    p += "LEGACY PACK (science/claim reference ONLY, do not restore card quizzes): " + legacy_docs + "\n";
    p += "LOCAL URL: " + game_url + "\n";
    p += "LOCALE: " + locale + "\n";
    p += "LIVE_DEPLOY_REQUESTED: " + do_deploy.to_string() + "\n";
    p += "\nAUTHORITY ORDER:\n";
    p += "1) Team science/safety sign-off if present\n";
    p += "2) New full script Life_Circuit_Chengwan_Full_Game_Script_v1 (game-first)\n";
    p += "3) Legacy 20_SOURCE_AND_CLAIM_REGISTER + safety wording only\n";
    p += "4) Legacy GDD/TDD stack notes if they do not conflict with the new script\n";
    p += "\nP0 SCOPE (implement ALL of these, no later chapters):\n";
    p += "- Title + Hub\n";
    p += "- Prologue 黑水線 P-S00 to P-S06\n";
    p += "- Optional Workshop 微觀工作坊 W-S00 to W-S05 (skippable, never a qualification gate)\n";
    p += "- Chapter 1 紅色警報 C1-S00 to C1-S08\n";
    p += "Do NOT implement chapters 2–final. Leave honest stubs only if a door is visible.\n";
    p += "\nSTACK:\n";
    p += "- TypeScript strict, Vite, Three.js, semantic DOM HUD (not canvas text)\n";
    p += "- No backend, no accounts, no analytics, localStorage save only\n";
    p += "- Cloudflare Workers static assets SPA: wrangler.jsonc, compatibility_date 2026-08-15\n";
    p += "- assets.directory = ./dist, not_found_handling = single-page-application\n";
    p += "- Optional worker src/worker.ts for security headers + /health; no game state on server\n";
    p += "- Local: npx wrangler dev --port 8787 after vite build, or vite for fast iterate then wrangler for deploy-parity\n";
    p += "\nHARD RULES:\n";
    p += "A) Game-first: 30s visible goal, 90s spatial verb, no card/quiz Critical Path, no red-X fail screens.\n";
    p += "B) Tools: Flow Lens (pulse, direction, occlusion, battery), Tether (weight/rotate/snap), Sealed Bio-Rig (sense/regulate/output). No sequences, culture conditions, or wet-lab how-to.\n";
    p += "C) Terms appear AFTER the player operates the phenomenon. No developer-voice disclaimers in player UI.\n";
    p += "D) Evidence is seen/measured/carried. Claim is a placement/action. Consequence changes the world. Revision keeps first failure.\n";
    p += "E) All readouts are teaching_simulation. Screening ≠ confirmation ≠ cleanup. No environmental release. No zero-risk claims.\n";
    p += "F) Reporter output always has shape/sound/animation, not color alone. Failed control blocks strong unknown claims.\n";
    p += "G) Residents are stakeholders. Chen's walk must change output + notification. Two valid monitoring models.\n";
    p += "H) Use tools (read_file, grep, list_dir, write/edit, shell). Never invent repo state from memory.\n";
    p += "I) Idempotent edits. Preserve existing architecture. After work: files changed, commands run, remaining gaps with paths.\n";
    p += "J) Privacy: no names/schools/health/photos. No chat. No remote telemetry.\n";
    p += "K) Accessibility: relaxed timer, reduced motion, keyboard + mouse, large subtitles, color+shape.\n";
    p += "L) Do not copy assets, UI, VO, or level layouts from PEAK, R.E.P.O., Outer Wilds, Pacific Drive, Portal, or any cited game. Borrow structure only.\n";
    p
}

fn science_rules() {
    let p = "";
    p += "SCIENCE BOUNDARIES:\n";
    p += "- Mainline teaches transferable terms only: cell, DNA, gene, RNA, protein, promoter, regulator, reporter, input/output, control, replicate, containment, biosafety, biosecurity, stakeholder, pilot.\n";
    p += "- Do not require memorizing MerR/Pmer/dTomato as a password. Named cases are application background.\n";
    p += "- Mechanism literature ≠ team proposal ≠ team experiment ≠ story fiction ≠ teaching simulation.\n";
    p += "- Player never samples, diagnoses, enforces, or approves deployment.\n";
    p += "- Failed positive control must make unknown unreadable until repaired.\n";
    p
}

fn cf_rules() {
    let p = "";
    p += "CLOUDFLARE RULES:\n";
    p += "- wrangler.jsonc (not toml). name life-circuit-chengwan. workers_dev true.\n";
    p += "- compatibility_date 2026-08-15. Observability optional; do NOT add Web Analytics that collect workshop PII.\n";
    p += "- Static assets from Vite dist. SPA fallback. Cache static hashed files; no-cache index.html.\n";
    p += "- Worker may set CSP (allow WebGL/wasm/blob), COOP/COEP only if they do not break Three.js, X-Content-Type-Options, Referrer-Policy.\n";
    p += "- No KV/D1/R2 required for P0. No secrets. No accounts.\n";
    p += "- Local test MUST use wrangler dev (deploy parity). vite preview is extra, not a substitute for the Cloudflare path.\n";
    p += "- Live deploy only if wrangler whoami succeeds AND LIVE_DEPLOY_REQUESTED is true. Otherwise stop after dry-run and write the blocker honestly.\n";
    p += "- Fetch current Workers static-assets + wrangler config docs before writing wrangler.jsonc. Do not invent flags.\n";
    p
}

// ── args with defaults (no pause / no gate) ─────────────────────────────

let repo_root = "C:/Users/daive/life-circuit-chengwan";
let script_txt = "C:/Users/daive/Downloads/Life_Circuit_Chengwan_Full_Game_Script_v1.txt";
let legacy_docs = "C:/Users/daive/Downloads/iGEM_2026_game_production_pack_updated/iGEM_2026_game_production_pack - 複製";
let game_url = "http://127.0.0.1:8787";
let focus = "full";
let locale = "zh-Hant";
let do_deploy = false;
let resume_note = "";

if args != () {
    repo_root = as_str(args.repo_root, repo_root);
    script_txt = as_str(args.script_txt, script_txt);
    legacy_docs = as_str(args.legacy_docs, legacy_docs);
    game_url = as_str(args.game_url, game_url);
    focus = as_str(args.focus, focus);
    if focus == "" { focus = "full"; }
    locale = as_str(args.locale, locale);
    do_deploy = as_bool(args.deploy, false);
    resume_note = as_str(args.resume_note, "");
}

log("life-circuit-chengwan | no gates | focus=" + focus + " | deploy=" + do_deploy.to_string());
log("repo=" + repo_root);
log("script=" + script_txt);
log("game_url=" + game_url);
if resume_note != "" {
    log("resume_note=" + resume_note);
}

let wave_log = [];
let failures = 0;

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "intake") {
    phase("Intake");
    log("Intake: P0 contract from the new script");

    let p = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p += "ROLE: Technical Producer.\n";
    p += "TASK: Read the NEW script sections for Prologue, Workshop, Chapter 1, Fun/Learning gates, and Cloudflare-relevant end matter.\n";
    p += "Skim legacy README only for claim/safety conflict notes.\n";
    p += "Write:\n";
    p += "- " + repo_root + "/docs/delivery/p0-contract.md (in/out scope, scene table, flags, acceptance, Fun Gate, Learning Gate)\n";
    p += "- " + repo_root + "/docs/delivery/p0-manifest.json (scenes, tools, save fields, budgets)\n";
    p += "Create the repo folder if missing. Do not implement the full game yet.\n";
    p += science_rules();
    p += cf_rules();

    let r = agent(p, #{ label: "intake-producer", capability_mode: "all" });
    if agent_ok(r) { wave_log.push("Intake: ok"); } else { wave_log.push("Intake: FAILED"); failures += 1; }
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "science") {
    phase("Science");
    log("Science / education / safety panel");

    let jobs = [];

    let p1 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p1 += "ROLE: Synthetic Biology PI.\n";
    p1 += "Read new script C1 + workshop science beats and legacy claim register if present.\n";
    p1 += "Write " + repo_root + "/docs/claims/p0-claims.md and " + repo_root + "/content/claims/p0.json\n";
    p1 += "Approved wording, forbidden wording, maturity tags. No invented assay numbers.\n";
    p1 += science_rules();
    jobs.push(#{ prompt: p1, label: "science-pi", capability_mode: "all" });

    let p2 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p2 += "ROLE: Education + Human Practices lead.\n";
    p2 += "Write " + repo_root + "/docs/education/p0-learning.md\n";
    p2 += "Map each scene to: first experience, later name, transfer check. Workshop skip must not block C1.\n";
    p2 += "Chen walk changes design. Public map cannot open cleanup/safe-river layers.\n";
    jobs.push(#{ prompt: p2, label: "edu-hp", capability_mode: "all" });

    let p3 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p3 += "ROLE: Biosafety / ethics reviewer.\n";
    p3 += "Write " + repo_root + "/docs/safety/p0-boundaries.md\n";
    p3 += "Block wet-lab how-to, player contact with unknown material, environmental release, medical diagnosis, zero-risk.\n";
    p3 += science_rules();
    jobs.push(#{ prompt: p3, label: "safety-ethics", capability_mode: "all" });

    failures += record_slot(wave_log, "Science", parallel(jobs));
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "design") {
    phase("Design");
    log("Game-first design package");

    let jobs = [];

    let d1 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    d1 += "ROLE: Lead Level Designer (game-first, not classroom).\n";
    d1 += "Read P-S00–P-S06, W-S00–W-S05, C1-S00–C1-S08 from the NEW script.\n";
    d1 += "Write " + repo_root + "/docs/design/p0-level.md and " + repo_root + "/docs/design/p0-beats.json\n";
    d1 += "Each beat: visible goal, verb, spatial puzzle, failure consequence, recovery, no quiz bypass.\n";
    d1 += "Cite PEAK/REPO/Outer Wilds/Pacific Drive/Portal 2 as structure only.\n";
    jobs.push(#{ prompt: d1, label: "level-design", capability_mode: "all" });

    let d2 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    d2 += "ROLE: Systems designer for Flow Lens, Tether, Bio-Rig, controls docks, triangulation.\n";
    d2 += "Write " + repo_root + "/docs/design/p0-systems.md with state flags from the script.\n";
    d2 += "Flow Lens must be able to lie (bright dead line vs flowing line). Controls decide readability.\n";
    jobs.push(#{ prompt: d2, label: "systems-design", capability_mode: "all" });

    let d3 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    d3 += "ROLE: UX / HUD designer.\n";
    d3 += "Write " + repo_root + "/docs/design/p0-ui.md\n";
    d3 += "Task line = verb + object. Dialogue <= ~12s. Codex optional. No score, no persuasion meter.\n";
    jobs.push(#{ prompt: d3, label: "ux-design", capability_mode: "all" });

    failures += record_slot(wave_log, "Design", parallel(jobs));
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "scaffold") {
    phase("Scaffold");
    log("Create Vite + Three.js + Cloudflare repo");

    let p = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p += "ROLE: Technical Lead / repo architect.\n";
    p += "TASK: Create or complete the playable repo skeleton at REPO if missing.\n";
    p += "Must exist:\n";
    p += "- package.json (vite, typescript, three, wrangler). npm lock only.\n";
    p += "- tsconfig strict, vite.config.ts (base './'), index.html\n";
    p += "- wrangler.jsonc with name life-circuit-chengwan, compatibility_date 2026-08-15,\n";
    p += "  main src/worker.ts, assets.directory dist, assets.not_found_handling single-page-application,\n";
    p += "  assets.binding ASSETS, observability.enabled false or true without PII, workers_dev true\n";
    p += "- src/worker.ts: security headers + env.ASSETS.fetch; /health JSON; SPA fallback\n";
    p += "- src/main.ts game bootstrap; src/engine/; src/scenes/; src/content/; src/ui/\n";
    p += "- README.md in Traditional Chinese: npm i, npm run dev, npm run build, npm run cf:dev, npm run cf:dry, npm run cf:deploy\n";
    p += "- AGENTS.md with authority + hard rules\n";
    p += "Scripts: dev=vite, build=vite build, preview=vite preview, cf:dev=build && wrangler dev --port 8787, cf:dry=build && wrangler deploy --dry-run, cf:deploy=build && wrangler deploy\n";
    p += "Install deps. Typecheck if possible. Do not implement all scenes in this phase.\n";
    p += cf_rules();

    let r = agent(p, #{ label: "scaffold-tech-lead", capability_mode: "all" });
    if agent_ok(r) { wave_log.push("Scaffold: ok"); } else { wave_log.push("Scaffold: FAILED"); failures += 1; }
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "engine") {
    phase("Engine");
    log("Shared 3D engine and tools");

    let jobs = [];

    let e1 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    e1 += "ROLE: Senior gameplay / Three.js engineer.\n";
    e1 += "Implement third-person motor, camera, collision, step-up, safety-rope recovery, interact prompts.\n";
    e1 += "No jump combat. WASD + mouse look + E interact + hold Q scan + hold RMB or F tether.\n";
    e1 += "Write src/engine/* and unit-testable helpers where possible.\n";
    e1 += "Greybox primitives are OK if polished lighting/rain/fog make them readable.\n";
    jobs.push(#{ prompt: e1, label: "engine-player", capability_mode: "all" });

    let e2 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    e2 += "ROLE: Tools engineer (Flow Lens + Tether + Bio-Rig).\n";
    e2 += "Flow Lens: charge, pulse, flowing vs bright-dead, occlusion, battery after first free scan.\n";
    e2 += "Tether: grab, pull, rotate, shape-keyed sockets, drop recovery.\n";
    e2 += "Bio-Rig: three visible slots, sealed, no open-shell wet lab.\n";
    e2 += "Must be usable in Prologue then reused in Workshop and C1.\n";
    jobs.push(#{ prompt: e2, label: "engine-tools", capability_mode: "all" });

    let e3 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    e3 += "ROLE: Narrative / UI / save engineer.\n";
    e3 += "Dialogue overlay with official line IDs from the new script. Objective HUD. Codex one-liner.\n";
    e3 += "Save schema: locale, prologueComplete, workshop.complete, workshop.available, tools, c1.* flags, monitoringModel, runHistory.\n";
    e3 += "Skipping workshop never sets workshop.complete. Settings: relaxed timer, reduced motion, subtitle size.\n";
    e3 += "Traditional Chinese player-facing copy. English only if locale=both.\n";
    jobs.push(#{ prompt: e3, label: "engine-ui-save", capability_mode: "all" });

    failures += record_slot(wave_log, "Engine", parallel(jobs));
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "build") {
    phase("Build");
    log("Parallel scene implementation: Prologue / Workshop / Chapter 1");

    let jobs = [];

    let b0 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    b0 += "ROLE: Prologue implementer.\n";
    b0 += "Implement P-S00 to P-S06 as playable 3D, not cutscenes-only.\n";
    b0 += "Visible flood gate + orange beacon at start. Yellow maintenance line. Dead elevator + toolbox + ladder.\n";
    b0 += "First Lens pulse free. Bright dead line vs flowing line. Tether two plates, shape sockets.\n";
    b0 += "Three relays combine Lens+Tether. Evac 70s or relaxed. Rescue Xiaocen. Hub choice after title.\n";
    b0 += "Write only under src/scenes/prologue/ and related content/prologue/. Do not rewrite other chapters.\n";
    b0 += "Use official dialogue IDs P-S0x-D00x.\n";
    jobs.push(#{ prompt: b0, label: "build-prologue", capability_mode: "all" });

    let b1 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    b1 += "ROLE: Workshop implementer.\n";
    b1 += "Implement W-S00 to W-S05 as a walkable 3D cell model. Optional. Exit anytime on a safe pad.\n";
    b1 += "Look-at cell/DNA/gene frames. Transcription copy not consume. Translation fold protein, RNA does not fit lock.\n";
    b1 += "Smoke input → gate → reporter; swap reporter shape. Moon/sun/? docks; first run sun broken; repair then name controls.\n";
    b1 += "Write only src/scenes/workshop/ and content/workshop/. Official IDs W-S0x-D00x.\n";
    b1 += science_rules();
    jobs.push(#{ prompt: b1, label: "build-workshop", capability_mode: "all" });

    let b2 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    b2 += "ROLE: Chapter 1 implementer.\n";
    b2 += "Implement C1-S00 to C1-S08. Loadout battery vs shell (both completable).\n";
    b2 += "Signal hunt (no A/B/C/D waypoints). Probe saturates all directions → carry back. Controls docks. Keep failed run.\n";
    b2 += "Triangulation with two beacons + moving probe. Chen usability walk changes shape+sound+update duty.\n";
    b2 += "Storm finale: flowing vs bright-dead pipe, latch so power flicker does not wipe progress, drone not player enters unknown.\n";
    b2 += "Public map layers from run history; missing cleanup layer shows no data. Choose fixed_station or portable_kits; world changes.\n";
    b2 += "Write only src/scenes/chapter1/ and content/chapter1/. Official IDs C1-S0x-D00x.\n";
    b2 += science_rules();
    jobs.push(#{ prompt: b2, label: "build-chapter1", capability_mode: "all" });

    failures += record_slot(wave_log, "Build", parallel(jobs));
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "integrate") {
    phase("Integrate");
    log("Wire Hub, routes, shared flags");

    let p = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p += "ROLE: Principal integrator.\n";
    p += "Wire title → prologue → hub → (workshop optional) → chapter 1 → chapter-2 teaser only.\n";
    p += "Hub has two physical doors. Skip workshop has no warning and does not mark complete.\n";
    p += "C1 dialogue uses formal terms only if workshop.complete, else lived language (D003 vs D003A).\n";
    p += "Loadout persists. runHistory persists. monitoringModel changes ending vista.\n";
    p += "Fix compile/type errors from parallel scene work. Keep Critical Path playable.\n";
    p += "Add debug chapter select only behind ?debug=1, never as default QA bypass for players.\n";

    let r = agent(p, #{ label: "integrator", capability_mode: "all" });
    if agent_ok(r) { wave_log.push("Integrate: ok"); } else { wave_log.push("Integrate: FAILED"); failures += 1; }
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "cloudflare") {
    phase("Cloudflare");
    log("Harden Workers static-asset deploy path");

    let p = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p += "ROLE: Cloudflare Workers engineer.\n";
    p += "Retrieve current docs: https://developers.cloudflare.com/workers/static-assets/ and wrangler configuration before editing.\n";
    p += "Ensure wrangler.jsonc is valid. Worker serves ASSETS, SPA not_found_handling, /health, security headers that do not break WebGL.\n";
    p += "vite base './' so workers.dev and custom domains both work. Hashed assets cacheable.\n";
    p += "Add .gitignore for node_modules, dist, .wrangler.\n";
    p += "Write " + repo_root + "/docs/ops/cloudflare.md (local wrangler dev, dry-run, deploy, rollback).\n";
    p += "Run npm run build in the repo. Fix build errors.\n";
    p += "Then run npx wrangler deploy --dry-run from the repo and capture output to docs/ops/dry-run.txt.\n";
    p += "If wrangler missing, npm i -D wrangler@latest.\n";
    p += cf_rules();

    let r = agent(p, #{ label: "cf-engineer", capability_mode: "all" });
    if agent_ok(r) { wave_log.push("Cloudflare: ok"); } else { wave_log.push("Cloudflare: FAILED"); failures += 1; }
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "local-test") {
    phase("LocalTest");
    log("Local Wrangler boot + playthrough");

    let p_boot = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p_boot += "ROLE: Local platform operator.\n";
    p_boot += "1) In REPO: install if needed, npm run build.\n";
    p_boot += "2) Start wrangler so " + game_url + " serves the built SPA (npx wrangler dev --port 8787). Background the process.\n";
    p_boot += "3) curl/fetch / and /health. Write actual URL to " + repo_root + "/docs/qa/server-url.txt\n";
    p_boot += "4) Fix boot blockers. Do not skip Wrangler in favor of a random static server unless wrangler cannot start — then document the blocker and fall back to vite preview, still recording the gap.\n";
    p_boot += cf_rules();

    let r_boot = agent(p_boot, #{ label: "local-boot", capability_mode: "all" });
    if agent_ok(r_boot) { wave_log.push("LocalTest boot: ok"); } else { wave_log.push("LocalTest boot: FAILED"); failures += 1; }

    let p_play = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p_play += "ROLE: Live playtest QA.\n";
    p_play += "Use browser-use (new_tab first) against " + game_url + " or server-url.txt.\n";
    p_play += "Play as far as the build allows: title, prologue movement/scan/tether, hub doors, workshop one verb, C1 hunt or loadout.\n";
    p_play += "Record console errors, black screens, unreadable HUD, quiz regressions, overclaim wording.\n";
    p_play += "Write " + repo_root + "/docs/qa/p0-browser-findings.md with S0–S3.\n";
    p_play += "If Chrome remote debugging is blocked, run browser-use --doctor, document, then use curl + reading the built index as a partial fallback — say what you could not click.\n";

    let r_play = agent(p_play, #{ label: "local-play", capability_mode: "all" });
    if agent_ok(r_play) { wave_log.push("LocalTest play: ok"); } else { wave_log.push("LocalTest play: FAILED"); failures += 1; }

    let p_fix = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p_fix += "ROLE: Director fixer after live QA.\n";
    p_fix += "Read docs/qa/p0-browser-findings.md. Fix S0/S1 that block boot or Critical Path.\n";
    p_fix += "Rebuild. Keep Wrangler path working.\n";
    let r_fix = agent(p_fix, #{ label: "local-fix", capability_mode: "all" });
    if agent_ok(r_fix) { wave_log.push("LocalTest fix: ok"); } else { wave_log.push("LocalTest fix: FAILED"); failures += 1; }
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "verify") {
    phase("Verify");
    log("Adversarial verification (fail closed)");

    let jobs = [];

    let v1 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    v1 += "ROLE: Adversarial science verifier. Fail closed.\n";
    v1 += "Inspect actual player-facing strings and simulation code. PASS/FAIL/MISSING with file evidence.\n";
    v1 += "Write " + repo_root + "/docs/qa/p0-verify-science.md\n";
    v1 += "Trivial wording fixes only. Missing evidence = FAIL.\n";
    v1 += science_rules();
    jobs.push(#{ prompt: v1, label: "verify-science", capability_mode: "all" });

    let v2 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    v2 += "ROLE: Adversarial playability verifier. Fail closed.\n";
    v2 += "Confirm Critical Path cannot be cleared by clicking every option. Tools exist. Workshop skip legal.\n";
    v2 += "Write " + repo_root + "/docs/qa/p0-verify-play.md\n";
    jobs.push(#{ prompt: v2, label: "verify-play", capability_mode: "all" });

    let v3 = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    v3 += "ROLE: Adversarial Cloudflare/deploy verifier. Fail closed.\n";
    v3 += "Read wrangler.jsonc, worker, package scripts, dry-run log if present.\n";
    v3 += "Confirm SPA fallback, no required backend, no secrets, health route, local wrangler path documented.\n";
    v3 += "Write " + repo_root + "/docs/qa/p0-verify-cloudflare.md\n";
    v3 += cf_rules();
    jobs.push(#{ prompt: v3, label: "verify-cloudflare", capability_mode: "all" });

    failures += record_slot(wave_log, "Verify", parallel(jobs));
}

// ════════════════════════════════════════════════════════════════════════
if wave_on(focus, "deploy") {
    phase("Deploy");
    log("Dry-run always; live only if requested and authenticated");

    let p = ctx(repo_root, script_txt, legacy_docs, game_url, locale, do_deploy);
    p += "ROLE: Release engineer.\n";
    p += "1) npm run build in REPO.\n";
    p += "2) npx wrangler deploy --dry-run. Save output to " + repo_root + "/docs/ops/dry-run.txt\n";
    p += "3) npx wrangler whoami. Save redacted status to " + repo_root + "/docs/ops/whoami.txt (no tokens).\n";
    p += "4) If LIVE_DEPLOY_REQUESTED is true AND whoami shows a logged-in account: npx wrangler deploy.\n";
    p += "   Write the workers.dev URL to " + repo_root + "/docs/ops/deployed-url.txt\n";
    p += "5) If not authenticated or LIVE_DEPLOY_REQUESTED is false: do NOT deploy. Write honest next command.\n";
    p += "6) Write " + repo_root + "/RELEASE/p0/RELEASE_NOTES.md (zh-Hant) and ACCEPTANCE.md.\n";
    p += "Never claim PUBLISH_READY if Critical Path is unplayable or dry-run failed.\n";
    p += cf_rules();

    let r = agent(p, #{ label: "release-engineer", capability_mode: "all" });
    if agent_ok(r) { wave_log.push("Deploy: ok"); } else { wave_log.push("Deploy: FAILED"); failures += 1; }
}

// ── report ──────────────────────────────────────────────────────────────

let report = "";
report += "# 生命迴路：澄灣 P0 工作流報告\n\n";
report += "- **Repo:** " + repo_root + "\n";
report += "- **Script:** " + script_txt + "\n";
report += "- **Focus:** " + focus + "\n";
report += "- **Local URL:** " + game_url + "\n";
report += "- **Live deploy requested:** " + do_deploy.to_string() + "\n";
report += "- **Gates:** none\n";
report += "- **Agent failures:** " + failures.to_string() + "\n\n";
report += "## Wave log\n\n";
for line in wave_log {
    report += "- " + line + "\n";
}
report += "\n## Expected artifacts\n\n";
report += "- docs/delivery/p0-contract.md\n";
report += "- wrangler.jsonc + src/worker.ts\n";
report += "- src/scenes/prologue|workshop|chapter1\n";
report += "- docs/qa/p0-browser-findings.md\n";
report += "- docs/ops/dry-run.txt\n";
report += "- RELEASE/p0/RELEASE_NOTES.md\n";
report += "\n## How to run locally\n\n";
report += "```\ncd " + repo_root + "\nnpm install\nnpm run build\nnpm run cf:dev\n```\n";
report += "Then open " + game_url + "\n\n";
report += "## How to deploy\n\n";
report += "```\nnpx wrangler login\nnpm run cf:dry\nnpm run cf:deploy\n```\n";
report += "Or re-run this workflow with args.deploy=true after login.\n";

let report_path = write_scratch_file("p0-run-report.md", report);
log("failures=" + failures.to_string() + " report=" + report_path);

complete(#{
    summary: "P0 workflow finished with " + failures.to_string() + " failed agent slots",
    repo_root: repo_root,
    game_url: game_url,
    focus: focus,
    deploy_requested: do_deploy,
    failures: failures,
    report_path: report_path,
});
