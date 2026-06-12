import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceAll(from, to) {
  if (app.includes(from)) {
    app = app.split(from).join(to);
  }
}

replaceAll(
  `<p className="page-subtitle">主管檢視用，先依人員與日期完整展示 AI 草稿，不打散到個人頁。</p>`,
  `<p className="page-subtitle">依人員與日期檢視前日系統行為；今日應注意聚焦逾期與 7 日內到期工作。</p>`
);

replaceAll(`yesterday_progress: '昨日人員進度',`, `yesterday_progress: '前日工作日報',`);
replaceAll(`progress: '昨日人員進度',`, `progress: '前日工作日報',`);

replaceAll(
  `<span className="muted">{logs.length} 筆</span>`,
  `<span className="muted">{logs.length} 筆 / 補登入口未開放</span>`
);

replaceAll(
  `這一天沒有非任務工作回報。若人員有支援、樣檢協助、臨時交辦或廠內協調，未來應在這裡登錄。`,
  `這一天沒有非任務工作回報。此區目前只展示已登錄資料；補登入口尚未開放。`
);

fs.writeFileSync(appPath, app, 'utf8');
