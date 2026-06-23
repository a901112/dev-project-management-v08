import fs from 'node:fs';

const apiPath = new URL('../src/api.ts', import.meta.url);
let api = fs.readFileSync(apiPath, 'utf8');

api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false }),",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false })"
);

api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false }),",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false })"
);

api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false })",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false }),"
);

fs.writeFileSync(apiPath, api, 'utf8');

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('DailyReportRuns')) {
  const latestDateName = app.includes('latestAvailableDate')
    ? 'latestAvailableDate'
    : app.includes('latestReportDate')
      ? 'latestReportDate'
      : 'activeDate';
  const emptyStateHint = `\n          {${latestDateName} && <span> 最近可用日期：{${latestDateName}}。</span>}\n          <span> 若今天應有日報，請檢查 DailyReportRuns 是否成功，或手動補跑該日期。</span>`;

  let patched = app.replace(
    /(\{reports\.length === 0 \? \(\s*<div className="empty-card">[\s\S]*?)(\s*<\/div>\s*\) : visibleReports\.length === 0 \? \()/,
    `$1${emptyStateHint}$2`
  );

  patched = patched.replace(
    /(visibleReports\.length === 0 \? \(\s*<div className="empty-card">[\s\S]*?)(\s*<\/div>\s*\) : \()/,
    `$1${emptyStateHint}$2`
  );

  if (patched === app) {
    throw new Error('patch-v64 daily report fallback marker not found');
  }

  app = patched;
  fs.writeFileSync(appPath, app, 'utf8');
}
