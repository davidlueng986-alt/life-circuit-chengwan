import { assertPlayerCopy } from "../../src/content/banned";

/** Extra C1 prompts not already in src/content/copy.ts. Official VO stays in dialogue.ts. */
export const C1_PROMPT = {
  cageIn: "放入 運輸籠",
  fenceLook: "查看 封鎖線",
  demoPlace: "放下 示範探頭",
} as const;

for (const [key, line] of Object.entries(C1_PROMPT)) {
  assertPlayerCopy(line, `C1_PROMPT.${key}`);
}
