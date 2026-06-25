# 台灣公民與主權地圖｜Taiwan Civic & Sovereignty Map

A Vercel-ready static OpenStreetMap website for public, verifiable civic organization and event information in Taiwan.

## 維護方式

- 不需要 build。
- 不需要 dist。
- 不需要 React / Next.js。
- 新增、刪除、修改資料：只改 `data.js`。
- 首頁：`index.html`。
- 樣式：`styles.css`。
- 地圖與互動：`app.js`。

## Vercel 部署

1. 將此資料夾上傳到 GitHub repository 根目錄。
2. 到 Vercel 匯入該 repository。
3. Framework Preset 選 `Other`。
4. Build Command 留空。
5. Output Directory 留空或填 `.`。
6. Deploy。

## 資料安全原則

只放公開登記資料、官方網站、公開活動報名頁。不要放私人住址、未公開聚會、個人成員追蹤資訊。
