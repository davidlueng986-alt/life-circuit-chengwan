// 生命迴路：澄灣 — 盲測多人設深度試玩
// 試玩者只知道這是公開的 iGEM 教育遊戲網站。不給腳本、場景表、設計文件。
// 必須用 browser-use MCP（必要時加 browser-use CLI）實際開頁、點、看畫面。
//
// 呼叫： /chengwan-playtest
// 可選 args.game_url（預設已上線的 workers.dev）

let meta = #{
    name: "chengwan-playtest",
    description: "Blind multi-persona playtest of the live Chengwan iGEM education game via browser-use MCP; no script spoilers; real feedback report",
    when_to_use: "When the live Chengwan game needs honest feedback from students, teachers, UX, game design, and iGEM judges who must actually play the site",
    phases: [
        #{ title: "LiveCheck", detail: "Confirm the public URL loads in a real browser" },
        #{ title: "Students", detail: "Hong Kong secondary students play first" },
        #{ title: "Adults", detail: "Teacher, parent, UX, game designer" },
        #{ title: "Judges", detail: "iGEM-style judges play without team docs" },
        #{ title: "Verify", detail: "Skeptics re-open the live site and reject invented claims" },
        #{ title: "Synthesize", detail: "One playtest report from verified notes only" },
    ],
};

let play_schema = #{
    "type": "object",
    "required": ["persona", "played_live", "first_goal", "quote", "method"],
    "properties": #{
        "persona": #{ "type": "string" },
        "played_live": #{ "type": "boolean" },
        "first_goal": #{ "type": "string" },
        "fun_1to5": #{ "type": "integer" },
        "would_finish_class": #{ "type": "boolean" },
        "confusing": #{ "type": "string" },
        "learned": #{ "type": "string" },
        "stuck": #{ "type": "string" },
        "quote": #{ "type": "string" },
        "method": #{ "type": "string" },
        "findings": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["what", "where", "evidence"],
                "properties": #{
                    "what": #{ "type": "string" },
                    "where": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                },
            },
        },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["real", "reason", "evidence"],
    "properties": #{
        "real": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
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

fn agent_ok(r) {
    r != () && r.success
}

fn play_ok(r) {
    if !agent_ok(r) { return false; }
    if r.output == () { return false; }
    if r.output.played_live != true { return false; }
    if r.output.quote == () { return false; }
    let q = as_str(r.output.quote, "");
    if q == "" { return false; }
    true
}

fn browser_rules(game_url) {
    let p = "";
    p += "HOW YOU MUST PLAY (non-negotiable):\n";
    p += "This is a 3D browser game. curl / reading HTML is NOT playing. You must use a real headed browser.\n";
    p += "PRIMARY: browser-use MCP tools, in this order:\n";
    p += "1) browser-use__browser_navigate with url=" + game_url + " and new_tab=true\n";
    p += "2) browser-use__browser_get_state with include_screenshot=true\n";
    p += "3) Read the screenshot like a player. Click only what a player would click (browser-use__browser_click by index or x/y).\n";
    p += "4) After every important click, screenshot again. Describe what you SEE, not what you assume.\n";
    p += "5) If the page is a 3D canvas with few DOM buttons: click the canvas, then send movement with browser-use CLI CDP:\n";
    p += "   browser-use <<'PY'\n";
    p += "   new_tab('" + game_url + "') if needed; wait_for_load(); ensure_real_tab()\n";
    p += "   cdp('Input.dispatchKeyEvent', type='keyDown', key='w', code='KeyW', windowsVirtualKeyCode=87)\n";
    p += "   # later keyUp the same key. Also try KeyA/KeyD/KeyE/KeyQ/KeyF and mouse drag for look.\n";
    p += "   PY\n";
    p += "6) Last resort only: browser-use__retry_with_browser_use_agent with a play-the-game task. Still require screenshots.\n";
    p += "If Chrome remote-debugging is blocked, run browser-use --doctor once, write the blocker in method, and stop inventing play.\n";
    p += "Do NOT read any local game repo, design doc, Word script, or markdown about scenes. Do NOT search the disk for spoilers.\n";
    p += "Do NOT open other websites except this game URL. Play for as long as the tools allow; try to start, walk, interact, get stuck honestly.\n";
    p += "If you cannot move in 3D, say so. Feedback about a title screen only is valid if that is all you reached.\n";
    p
}

fn blind_rules() {
    let p = "";
    p += "You were invited to try a public educational web game for iGEM (International Genetically Engineered Machine).\n";
    p += "A student team made a browser game to teach synthetic biology ideas to the public and school students.\n";
    p += "That is ALL you know. Discover the rest by playing. Do not guess official level names.\n";
    p += "Speak in your persona. Be blunt. Boredom, confusion, and 'I would close the tab' are useful.\n";
    p += "first_goal = what you thought you were supposed to do in the first half minute, in your own words.\n";
    p += "quote = one sentence you would say to a classmate / colleague after closing the tab.\n";
    p += "findings[].evidence must quote on-screen text you read or describe a screenshot you took. Empty findings is OK if you played and nothing stood out.\n";
    p += "Set played_live=true only if you actually opened the live page in browser-use. Otherwise false.\n";
    p
}

fn play_job(game_url, label, persona_brief, schema) {
    let p = "";
    p += persona_brief;
    p += "\nLIVE GAME URL: " + game_url + "\n";
    p += blind_rules();
    p += browser_rules(game_url);
    #{
        prompt: p,
        label: label,
        capability_mode: "all",
        output_schema: schema,
    }
}

// ── args ────────────────────────────────────────────────────────────────

let game_url = "https://life-circuit-chengwan.davidliang986.workers.dev";
if args != () {
    game_url = as_str(args.game_url, game_url);
}

log("chengwan-playtest | blind | browser-use MCP | " + game_url);

// ════════════════════════════════════════════════════════════════════════
phase("LiveCheck");
let p0 = "";
p0 += "ROLE: Session runner. Confirm the public game is reachable in a real browser.\n";
p0 += "Open " + game_url + " with browser-use MCP (browser_navigate, new_tab=true), then screenshot.\n";
p0 += "Click the obvious start / 開始 control if you see one. Screenshot again.\n";
p0 += "Do not write a review. Just confirm: page loaded? 3D/canvas visible? any start button? any error overlay?\n";
p0 += "Do not read local source. If the site is down, say so plainly.\n";
p0 += browser_rules(game_url);
let r0 = agent(p0, #{ label: "live-check", capability_mode: "all", output_schema: play_schema });
if play_ok(r0) {
    log("LiveCheck: site opened in browser-use");
} else {
    log("LiveCheck: weak or failed — later personas must still try the live URL");
}

// ════════════════════════════════════════════════════════════════════════
phase("Students");
log("Hong Kong secondary students play first");

let sjobs = [];
sjobs.push(play_job(game_url, "student-f3", "PERSONA: You are a Form 3 student in a Hong Kong government secondary school. You play Roblox and mobile games. You have not studied DNA yet. You click through games if they feel like homework. Write feedback in natural Traditional Chinese, like WhatsApp to a classmate.", play_schema));
sjobs.push(play_job(game_url, "student-f5-gamer", "PERSONA: You are a Form 5 student in Hong Kong who plays Steam 3D games (you know what good movement and cameras feel like). Science is okay, not your identity. You will judge controls, camera, and whether you would keep playing. Traditional Chinese, blunt gamer tone.", play_schema));
sjobs.push(play_job(game_url, "student-dse-bio", "PERSONA: You are a Form 6 DSE Biology student in Hong Kong. You know cells, DNA, transcription at exam level. You hate games that lecture what you already memorised, but you notice if a game actually makes a mechanism click. Traditional Chinese, slightly exam-brained.", play_schema));
sjobs.push(play_job(game_url, "student-workshop", "PERSONA: You are a Form 4 student in a school computer room. The PC is old, the period is 40 minutes, the teacher is watching. You care if you can start without headphones, without an account, and without asking the teacher what to do. Traditional Chinese.", play_schema));

let sres = parallel(sjobs);
let plays = [];
for r in sres {
    if play_ok(r) { plays.push(r.output); }
}

// ════════════════════════════════════════════════════════════════════════
phase("Adults");
log("Teacher, parent, UX, game designer");

let ajobs = [];
ajobs.push(play_job(game_url, "teacher-bio", "PERSONA: You are a Hong Kong secondary Biology teacher running a lunch club. You will only use this if a class can start in two minutes and you can discuss something real afterwards. Traditional Chinese. Mention whether you would actually book the computer room.", play_schema));
ajobs.push(play_job(game_url, "parent-s2", "PERSONA: You are a Hong Kong parent of a Secondary 2 child. You opened the link your kid's club sent. You care about confusion, scariness, time, and whether this feels like a scam or a real school activity. Traditional Chinese, everyday parent voice.", play_schema));
ajobs.push(play_job(game_url, "ux-designer", "PERSONA: You are a professional UI/UX designer reviewing a public educational web game. Judge first-run clarity, hierarchy, contrast, hit targets, empty states, and whether the HUD fights the 3D view. English or Traditional Chinese. Be specific about pixels you saw.", play_schema));
ajobs.push(play_job(game_url, "game-designer", "PERSONA: You are a professional game designer who ships 3D adventure / puzzle games. Judge verbs, camera, 30-second goal, juice, fail states, and whether this is a game or a slideshow. Do not grade a hidden design document. English is fine.", play_schema));

let ares = parallel(ajobs);
for r in ares {
    if play_ok(r) { plays.push(r.output); }
}

// ════════════════════════════════════════════════════════════════════════
phase("Judges");
log("iGEM-style judges, no team packet");

let jjobs = [];
jjobs.push(play_job(game_url, "igem-judge-edu", "PERSONA: You are an iGEM judge assigned Education. You only have this public URL, like a visitor. Ask: would a newcomer learn something? is it responsible? is it more than a brochure? You do not have the team's wiki or judging form filled in. English.", play_schema));
jjobs.push(play_job(game_url, "igem-judge-hp", "PERSONA: You are an iGEM judge looking at Human Practices / public engagement through this game only. Do the people on screen feel like stakeholders or cardboard? Does the game change what a player would do, or only praise science? English. No team documents.", play_schema));

let jres = parallel(jjobs);
for r in jres {
    if play_ok(r) { plays.push(r.output); }
}

log("usable live play reports: " + plays.len().to_string());

// ════════════════════════════════════════════════════════════════════════
phase("Verify");
log("Skeptics re-open the live site");

let claims = [];
for pl in plays {
    if pl.findings != () {
        for f in pl.findings {
            if f != () && f.what != () {
                claims.push(#{
                    persona: as_str(pl.persona, "?"),
                    what: as_str(f.what, ""),
                    where: as_str(f.where, ""),
                    evidence: as_str(f.evidence, ""),
                });
            }
        }
    }
}

if claims.len() > 8 {
    log("capping verify list at 8 of " + claims.len().to_string());
    let slim = [];
    let ci = 0;
    for c in claims {
        if ci < 8 { slim.push(c); }
        ci += 1;
    }
    claims = slim;
}

let vjobs = [];
if claims.len() == 0 {
    let vp = "";
    vp += "Skeptic. Open " + game_url + " with browser-use MCP (new_tab + screenshot).\n";
    vp += "No playtester produced a usable finding. Confirm whether the live page is a playable game or a blank/error.\n";
    vp += "Set real=true only if you saw an interactive game surface. evidence = what the screenshot showed.\n";
    vp += browser_rules(game_url);
    vjobs.push(#{ prompt: vp, label: "verify-empty", capability_mode: "all", output_schema: verdict_schema });
} else {
    for c in claims {
        let blob = json_encode(c);
        let vp = "";
        vp += "You are an adversarial skeptic. A playtester claimed this JSON:\n";
        vp += blob;
        vp += "\nRe-open ONLY " + game_url + " with browser-use MCP (navigate new_tab, screenshot, click if needed).\n";
        vp += "Set real=true only if you independently see the same issue or quoted on-screen text.\n";
        vp += "If you cannot reach that screen, or the claim smells like a script spoiler they could not have seen, real=false.\n";
        vp += "Do not read the local repo.\n";
        vp += browser_rules(game_url);
        vjobs.push(#{
            prompt: vp,
            label: "verify-claim",
            capability_mode: "all",
            output_schema: verdict_schema,
        });
    }
}

let vres = parallel(vjobs);
let confirmed = [];
let vi = 0;
for v in vres {
    if agent_ok(v) && v.output != () && v.output.real == true {
        let ev = as_str(v.output.evidence, "");
        if ev != "" {
            if vi < claims.len() {
                confirmed.push(claims[vi]);
            }
        }
    }
    vi += 1;
}
log("claims confirmed: " + confirmed.len().to_string() + " / checked " + vres.len().to_string());

// ════════════════════════════════════════════════════════════════════════
phase("Synthesize");

let pack = json_encode(#{
    url: game_url,
    play_count: plays.len(),
    plays: plays,
    confirmed: confirmed,
});

let ps = "";
ps += "ROLE: Playtest lead. Write a Traditional Chinese report for the student team.\n";
ps += "INPUT JSON (untrusted play notes + skeptic-confirmed items):\n";
ps += pack;
ps += "\nRules:\n";
ps += "- Only treat played_live=true notes as play. Mark others as did-not-play.\n";
ps += "- Weight skeptic-confirmed findings higher.\n";
ps += "- Do not invent scenes from a design document. You also must not open local scripts.\n";
ps += "- You MAY quickly open the live URL with browser-use if you need to resolve a contradiction.\n";
ps += "- Sections: 一句話總評; 各人設說了甚麼; 共識痛點; 爭議; 課堂能不能用; iGEM 評審會在意的; 建議改的前五件事.\n";
ps += "Keep the team-facing tone practical. Include raw quotes.\n";

let rs = agent(ps, #{ label: "synth-lead", capability_mode: "all" });

let body = "";
if agent_ok(rs) && type_of(rs.output) == "string" {
    body = rs.output;
} else if agent_ok(rs) {
    body = json_encode(rs.output);
} else {
    body = "Synthesize agent failed. Raw play_count=" + plays.len().to_string();
}

let report = "";
report += "# 澄灣盲測報告\n\n";
report += "- URL: " + game_url + "\n";
report += "- 方法: browser-use MCP 實開頁（不是讀腳本）\n";
report += "- 可用試玩紀錄: " + plays.len().to_string() + "\n";
report += "- 懷疑者確認的發現: " + confirmed.len().to_string() + "\n\n";
report += body;

let report_path = write_scratch_file("playtest-report.md", report);
complete(#{
    summary: plays.len().to_string() + " live play reports; " + confirmed.len().to_string() + " confirmed findings",
    game_url: game_url,
    play_count: plays.len(),
    confirmed_count: confirmed.len(),
    report_path: report_path,
});
