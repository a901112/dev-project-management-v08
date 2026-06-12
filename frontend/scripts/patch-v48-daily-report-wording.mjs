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

replaceAll(
  `<h3><ClipboardList size={18} />AI 日報草稿</h3>`,
  `<h3><ClipboardList size={18} />日報草稿</h3>`
);

if (!app.includes('function dailyReportStatusLabel(')) {
  app = app.replace(
    `function DailyReportCard({ data, report, items }: { data: AppData; report: DailyReport; items: DailyReportItem[] }) {`,
    `function dailyReportStatusLabel(status: string) {
  const value = String(status || '').trim();
  if (!value || value === 'AI草稿' || value === 'AI 草稿' || value === 'AI 日報草稿') return '日報草稿';
  return value.replace(/^AI\\s*/, '');
}

function DailyReportCard({ data, report, items }: { data: AppData; report: DailyReport; items: DailyReportItem[] }) {`
  );
}

app = app.replace(`<span>{report.Status || 'AI草稿'}</span>`, `<span>{dailyReportStatusLabel(report.Status)}</span>`);

fs.writeFileSync(appPath, app, 'utf8');
