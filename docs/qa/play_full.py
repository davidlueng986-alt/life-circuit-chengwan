import time
from pathlib import Path

out = Path("C:/Users/daive/life-circuit-chengwan-improve/docs/qa")

def save_shot(name: str) -> None:
    data = capture_screenshot()
    path = out / name
    if isinstance(data, str):
        src = Path(data)
        if src.exists():
            path.write_bytes(src.read_bytes())
            print("saved", path, path.stat().st_size)


def click_debug(token: str) -> None:
    js(
        """
(function(){
  var token = %s;
  var btns = Array.prototype.slice.call(document.querySelectorAll('#debug-select button'));
  var b = btns.find(function(x){ return (x.textContent || '').indexOf(token) >= 0; });
  if (b) b.click();
})()
"""
        % repr(token)
    )
    time.sleep(1.8)


def tap(sel: str, n=1) -> None:
    for _ in range(n):
        js(
            """
(function(){
  var el = document.querySelector(%s);
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, pointerId:7}));
    el.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, pointerId:7}));
  }
})()
"""
            % repr(sel)
        )
        time.sleep(0.25)


new_tab("http://127.0.0.1:4173/?debug=1")
wait_for_load()
time.sleep(0.8)
js("localStorage.clear()")
goto_url("http://127.0.0.1:4173/?debug=1")
wait_for_load()
time.sleep(0.7)
js("document.querySelector('#btn-new')?.click(); document.querySelector('#confirm-yes')?.click()")
time.sleep(2.8)
tap("#dialogue-next", 2)
tap('[data-act="go"]', 5)
time.sleep(0.4)
print("P00", js("({task: document.querySelector('#task-line')?.textContent, prompt: document.querySelector('#interact-verb')?.textContent})"))
save_shot("full-ps00.png")

click_debug("P-S01")
tap("#dialogue-next", 1)
tap('[data-act="e"]', 2)
print("P01", js("({task: document.querySelector('#task-line')?.textContent, prompt: document.querySelector('#interact-verb')?.textContent, list: document.querySelector('#interact-list')?.innerText})"))
save_shot("full-ps01.png")

click_debug("P-S02")
tap("#dialogue-next", 1)
tap('[data-act="e"]', 2)
print("P02", js("({task: document.querySelector('#task-line')?.textContent, prompt: document.querySelector('#interact-verb')?.textContent, fHidden: !!document.querySelector('[data-act=f]')?.hidden})"))
save_shot("full-ps02.png")

click_debug("P-S03")
tap("#dialogue-next", 1)
print("P03-before", js("({task: document.querySelector('#task-line')?.textContent, prompt: document.querySelector('#interact-verb')?.textContent, fHidden: !!document.querySelector('[data-act=f]')?.hidden})"))
tap('[data-act="e"]', 2)
time.sleep(0.4)
print("P03-after", js("({task: document.querySelector('#task-line')?.textContent, prompt: document.querySelector('#interact-verb')?.textContent, fHidden: !!document.querySelector('[data-act=f]')?.hidden})"))
save_shot("full-ps03.png")
print("DONE")
