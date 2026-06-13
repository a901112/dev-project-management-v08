import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const helper = `function dailyReportStatusLabel(status: string) {
  const value = String(status || '').trim();
  if (!value || value === 'AI\u8349\u7a3f' || value === 'AI \u8349\u7a3f' || value === 'AI \u65e5\u5831\u8349\u7a3f') return '\u65e5\u5831\u8349\u7a3f';
  return value.replace(/^AI\\s*/, '') || '\u65e5\u5831\u8349\u7a3f';
}

`;

if (app.includes('dailyReportStatusLabel(report.Status)') && !app.includes('function dailyReportStatusLabel(')) {
  const marker = app.includes('function DailyReportCard({ data, report, items }')
    ? 'function DailyReportCard({ data, report, items }'
    : '';
  if (!marker) throw new Error('patch-v52 marker not found: DailyReportCard');
  app = app.replace(marker, helper + marker);
}

fs.writeFileSync(appPath, app, 'utf8');
