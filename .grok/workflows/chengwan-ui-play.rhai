// 澄灣：UI／可玩性打磨迴圈
// 依據玩家差評（暗、無教學、無標籤、標題空洞、對白像壞掉）改畫面與操作。
// 每一輪都必須用 browser-use MCP 真的開網站玩，不能只讀程式。
//
// /chengwan-ui-play
// 可選 args.game_url  args.repo_root  args.rounds（預設 2）

let meta = #{
    name: "chengwan-ui-play",
    description: "Brighten and restyle Chengwan into a readable, labeled, tutorial-first game; verify each pass by playing with browser-use MCP",
    when_to_use: "When the live Chengwan game feels too dark, unlabeled, or unplayable and needs UI plus mechanic polish with real browser playtests",
    phases: [
        #{ title: "Play", detail: "browser-use MCP plays the live site as a student" },
        #{ title: "Fix", detail: "Implement lighting, HUD, labels, tutorial, dialogue, map" },
        #{ title: "Replay", detail: "Play again and list remaining pain" },
        #{ title: "Refine", detail: "Close remaining S0/S1 from the replay" },
        #{ title: "Ship", detail: "Build and deploy if possible" },
    ],
};

let play_schema = #{
    "type": "object",
    "required": ["played_live", "quote", "blockers"],
    "properties": #{
        "played_live": #{ "type": "boolean" },
        "quote": #{ "type": "string" },
        "readable": #{ "type": "boolean" },
        "knew_goal": #{ "type": "boolean" },
        "blockers": #{ "type": "array", "items": #{ "type": "string" } },
        "likes": #{ "type": "array", "items": #{ "type": "string" } },
    },
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

fn as_int(v, fallback) {
    if v == () { return fallback; }
    if type_of(v) == "string" {
        let t = trimmed(v);
        if t == "1" { return 1; }
        if t == "2" { return 2; }
        if t == "3" { return 3; }
    }
    fallback
}

fn agent_ok(r) {
    r != () && r.success
}

fn browser_how(url) {
    let p = "";
    p += "MUST play in a real browser with browser-use MCP:\n";
    p += "1) browser-use__browser_navigate url=" + url + " new_tab=true\n";
    p += "2) browser-use__browser_screenshot or get_state include_screenshot=true\n";
    p += "3) Click 開始冒險 / 開始. Screenshot. Try to walk and interact.\n";
    p += "4) If 3D needs keys, use browser-use CLI CDP Input.dispatchKeyEvent for KeyW/KeyE/KeyQ.\n";
    p += "Do NOT read the design script. Judge only what is on screen.\n";
    p += "If Chrome remote debug is blocked, run browser-use --doctor once and say so.\n";
    p
}

let repo_root = "C:/Users/daive/life-circuit-chengwan";
let game_url = "https://life-circuit-chengwan.davidliang986.workers.dev";
let rounds = 2;
if args != () {
    repo_root = as_str(args.repo_root, repo_root);
    game_url = as_str(args.game_url, game_url);
    rounds = as_int(args.rounds, 2);
}

log("chengwan-ui-play | " + game_url + " | rounds=" + rounds.to_string());

// ════════════════════════════════════════════════════════════════════════
phase("Play");
let p0 = "";
p0 += "ROLE: Hong Kong Form 4 student. You opened an iGEM education game.\n";
p0 += "URL: " + game_url + "\n";
p0 += browser_how(game_url);
p0 += "Write blockers as short strings about darkness, missing tutorial, unlabeled objects, broken dialogue, map, HUD.\n";
p0 += "quote = one sentence to a classmate.\n";
let r0 = agent(p0, #{ label: "play-student", capability_mode: "all", output_schema: play_schema });
let first_blockers = [];
if agent_ok(r0) && r0.output != () && r0.output.blockers != () {
    first_blockers = r0.output.blockers;
}
log("first play blockers=" + first_blockers.len().to_string());

// ════════════════════════════════════════════════════════════════════════
phase("Fix");
let spec = json_encode(first_blockers);
let p1 = "";
p1 += "ROLE: UI + game-feel lead. Edit ONLY " + repo_root + "\n";
p1 += "Player reviews already said:\n";
p1 += "- Default brightness too low; workshop is a black room.\n";
p1 += "- Dialogue has no Continue; clicking speaker hides lines.\n";
p1 += "- Public map is a button list; 3D does not react.\n";
p1 += "- HUD has no legend; probe triangle unreadable.\n";
p1 += "- English terms on the task line without Chinese.\n";
p1 += "- No crosshair/compass/objective marks; orange lamp invisible.\n";
p1 += "- Title is empty gradient + three identical buttons.\n";
p1 += "- Shared thin gold admin buttons; untextured boxes; one overhead light.\n";
p1 += "- No WASD/E tutorial; pointer lock hostile; relaxed timer hidden.\n";
p1 += "- Interactables must look obvious (glow + label). Character must walk/pick/push.\n";
p1 += "Also fix these live-play blockers JSON: " + spec + "\n";
p1 += "Implement in TypeScript/CSS/HTML. Brighten lights, add labels, tutorial card, Continue button, visual map, HUD legend, friendlier title, interact rings.\n";
p1 += "Default relaxedTimer and interactionList true. Do not request pointer lock on click.\n";
p1 += "Use read_file/grep before editing. Then npm run build in the repo.\n";
let r1 = agent(p1, #{ label: "fix-ui-play", capability_mode: "all" });
if agent_ok(r1) { log("Fix: ok"); } else { log("Fix: FAILED"); }

// ════════════════════════════════════════════════════════════════════════
phase("Replay");
let p2 = "";
p2 += "ROLE: Same Form 4 student, second session after a patch.\n";
p2 += "URL: " + game_url + "  (if deploy did not happen, also try http://127.0.0.1:4173 if it loads)\n";
p2 += browser_how(game_url);
p2 += "Compare to the old pain: can you see the yellow path? Do you know WASD/E? Are objects labeled? Does Continue exist?\n";
let r2 = agent(p2, #{ label: "replay-student", capability_mode: "all", output_schema: play_schema });

let p3 = "";
p3 += "ROLE: UI/UX reviewer. Play " + game_url + " with browser-use MCP.\n";
p3 += browser_how(game_url);
p3 += "Judge title, HUD legend, dialogue continue, contrast, labels, map feedback. blockers = remaining S0/S1 only.\n";
let r3 = agent(p3, #{ label: "replay-ux", capability_mode: "all", output_schema: play_schema });

let later = [];
if agent_ok(r2) && r2.output != () && r2.output.blockers != () {
    for b in r2.output.blockers { later.push(b); }
}
if agent_ok(r3) && r3.output != () && r3.output.blockers != () {
    for b in r3.output.blockers { later.push(b); }
}

// ════════════════════════════════════════════════════════════════════════
phase("Refine");
let pack = json_encode(later);
let p4 = "";
p4 += "ROLE: Director fixer. Repo " + repo_root + "\n";
p4 += "Close remaining blockers from this JSON (play evidence): " + pack + "\n";
p4 += "Prefer lighting, labels, tutorial, dialogue continue, map glow, interact rings, Chinese gloss.\n";
p4 += "Rebuild with npm run build.\n";
let r4 = agent(p4, #{ label: "refine-fix", capability_mode: "all" });
if agent_ok(r4) { log("Refine: ok"); } else { log("Refine: FAILED"); }

if rounds >= 2 {
    let p5 = "";
    p5 += "ROLE: Final smoke player. Play " + game_url + " with browser-use MCP after refine.\n";
    p5 += browser_how(game_url);
    p5 += "If the live URL still looks old, say CACHE and also try a hard reload. blockers only if still unreadable or unstartable.\n";
    let r5 = agent(p5, #{ label: "final-play", capability_mode: "all", output_schema: play_schema });
    if agent_ok(r5) { log("Final play done"); }
}

// ════════════════════════════════════════════════════════════════════════
phase("Ship");
let p6 = "";
p6 += "ROLE: Release. In " + repo_root + " run npm run build. Then npx wrangler deploy.\n";
p6 += "If deploy times out, retry once. Write the live URL. Do not claim Fun Gate passed.\n";
let r6 = agent(p6, #{ label: "ship-deploy", capability_mode: "all" });

let report = "# 澄灣 UI／可玩性打磨\n\n";
report += "- url: " + game_url + "\n";
report += "- first blockers: " + first_blockers.len().to_string() + "\n";
report += "- later blockers: " + later.len().to_string() + "\n";
let path = write_scratch_file("ui-play-report.md", report);
complete(#{
    summary: "UI/play polish loop finished",
    game_url: game_url,
    report_path: path,
});
