// 澄灣：可玩性再打磨。必須用 browser-use 真的開頁點螢幕按鈕走路。
// /chengwan-play-refine
// 可選 args.game_url  args.repo_root

let meta = #{
    name: "chengwan-play-refine",
    description: "Play Chengwan with browser-use using on-screen pad buttons, then fix remaining dark/unlabeled/stuck issues and redeploy",
    when_to_use: "When Chengwan still feels dark, abstract, or hard to walk and needs another live play-and-fix pass",
    phases: [
        #{ title: "Play", detail: "browser-use opens the live site and uses on-screen pad" },
        #{ title: "Fix", detail: "Patch remaining S0/S1 play blockers" },
        #{ title: "Replay", detail: "Play again after the patch" },
        #{ title: "Ship", detail: "Typecheck, build, deploy if possible" },
    ],
};

let play_schema = #{
    "type": "object",
    "required": ["played_live", "quote", "blockers"],
    "properties": #{
        "played_live": #{ "type": "boolean" },
        "quote": #{ "type": "string" },
        "readable": #{ "type": "boolean" },
        "could_walk": #{ "type": "boolean" },
        "blockers": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

let url = "https://life-circuit-chengwan.davidliang986.workers.dev";
let root = "C:/Users/daive/life-circuit-chengwan";
if (args != () && args.game_url != ()) { url = args.game_url; }
if (args != () && args.repo_root != ()) { root = args.repo_root; }

phase("Play");
let p1 = "";
p1 += "ROLE: Student playtester. Repo " + root + "\n";
p1 += "MUST play " + url + " with browser-use (CLI via uvx --from browser-use[cli] browser-use, or MCP).\n";
p1 += "First navigation: new_tab(url). Screenshot title. Click 開始冒險.\n";
p1 += "Then click on-screen buttons: W 前, 朝黃線走, E 互動, 繼續. Do NOT invent WASD if buttons exist.\n";
p1 += "If Chrome remote debug is blocked, run browser-use --doctor once, then still try uvx browser-use Python helpers.\n";
p1 += "Return played_live, a Cantonese quote, readable, could_walk, blockers.\n";
let play1 = agent(p1, #{ label: "play-1", capability_mode: "all", output_schema: play_schema });

phase("Fix");
let blockers = "";
if (play1 != () && play1.success && play1.output.blockers != ()) {
    blockers = json_encode(play1.output.blockers);
}
let p2 = "";
p2 += "ROLE: Gameplay engineer. Repo " + root + "\n";
p2 += "First play blockers: " + blockers + "\n";
p2 += "Fix lighting, labels, pad buttons, interact radii, Chinese gloss. Keep zh-Hant. No quiz Critical Path.\n";
p2 += "Do not mention wet-lab. Typecheck after edits.\n";
let fix1 = agent(p2, #{ label: "fix-1", capability_mode: "all" });

phase("Replay");
let p3 = "";
p3 += "ROLE: Replay student. Play " + url + " OR local preview after the fix.\n";
p3 += "Use browser-use. Click 開始冒險 then W 前 / 朝黃線走 / E 互動 / 繼續.\n";
p3 += "Return played_live, quote, readable, could_walk, remaining blockers.\n";
if (fix1 != () && fix1.success) { p3 += "Fix notes: the engineer just patched the repo.\n"; }
let play2 = agent(p3, #{ label: "play-2", capability_mode: "all", output_schema: play_schema });

phase("Ship");
let left = "";
if (play2 != () && play2.success && play2.output.blockers != ()) {
    left = json_encode(play2.output.blockers);
}
let p4 = "";
p4 += "ROLE: Ship. Repo " + root + "\n";
p4 += "Remaining blockers: " + left + "\n";
p4 += "Run npm test, npm run typecheck, npm run build. If Cloudflare is available, npm run cf:deploy.\n";
p4 += "Write docs/qa/play-refine.md with what was played and what is still weak.\n";
let ship = agent(p4, #{ label: "ship", capability_mode: "all" });

let quote = "";
if (play2 != () && play2.success && play2.output.quote != ()) { quote = play2.output.quote; }
let report = "chengwan-play-refine\nurl=" + url + "\nquote=" + quote + "\n";
let path = write_scratch_file("play-refine.md", report);
complete(#{ path: path, report: report, url: url });
