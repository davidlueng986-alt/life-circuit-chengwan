# Launch plan — 腳本為準

Authority: `docs/script/Life_Circuit_Chengwan_Full_Game_Script_v1.txt`  
Branch: `improve/fidelity`  
Reference games: PEAK, Pacific Drive, Portal 2, Outer Wilds, R.E.P.O. (structure only)

## 0 能看見、能過關
- 室內不過曝；黃線／橙燈／透鏡仍可讀
- P-S00：高處閘＋小岑 3 秒橙燈、黃燈帶、玻璃水位、走錯亮牆上短路線
- P-S03：E 取下連接工具，F 才抓板；重量／風／形狀槽

## 1 序章動詞（Portal 2）
- P-S02：三條線，跟流動不跟最亮；錯線 1 秒熄
- P-S04：三個高度不同的 relay，每修一層機械聲
- P-S05：70 秒撤離，接線不重置

## 2 手感與材質
- 走路加速／鏡頭阻尼
- Tether 質量與風
- Roblox 可讀材質（albedo＋roughness），角色更高密度

## 3 工作坊／河港／Hub
- W-S00 拉開細胞，對準 cell→DNA→gene
- 陳姨真的走過陰影
- Hub 先組裝再故意弄壞原型，再去現場

## 4 驗證→修→部署→推送
browser-use 走序章；`npm run build`；`wrangler deploy`；push `improve/fidelity`
