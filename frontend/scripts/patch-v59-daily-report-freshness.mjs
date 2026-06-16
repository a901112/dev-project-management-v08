import fs from 'fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v59 marker not found: ${label}`);
  return source.replace(from, to);
}

api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true }),",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false }),"
);
api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false }),",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false }),"
);

if (!api.includes("params.set('_'")) {
  api = replaceRequired(
    api,
    `  const params = new URLSearchParams({
    action,
    payload: JSON.stringify(payload),
    callback: callbackName
  });
`,
    `  const params = new URLSearchParams({
    action,
    payload: JSON.stringify(payload),
    callback: callbackName
  });
  params.set('_', \`${Date.now()}_${callbackSeq}\`);
`,
    'jsonp cache buster'
  );
}

if (!app.includes('useRef')) {
  app = replaceRequired(
    app,
    "import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';",
    "import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';",
    'useRef import'
  );
}

if (!app.includes('dailyReportRefreshKeyRef')) {
  app = replaceRequired(
    app,
    `  const [myTaskFilters, setMyTaskFilters] = useState<MyTaskFiltersState>(emptyMyTaskFilters);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);`,
    `  const [myTaskFilters, setMyTaskFilters] = useState<MyTaskFiltersState>(emptyMyTaskFilters);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const dailyReportRefreshKeyRef = useRef('');`,
    'daily report refresh ref'
  );
}

if (!app.includes('hasTodayReport')) {
  app = replaceRequired(
    app,
    `  useEffect(() => {
    if (user && isAdminOnlyView(view) && !canViewUsersPage(user)) setView('dashboard');
  }, [user, view]);
`,
    `  useEffect(() => {
    if (user && isAdminOnlyView(view) && !canViewUsersPage(user)) setView('dashboard');
  }, [user, view]);

  useEffect(() => {
    if (!token || !data || view !== 'dailyReports') return;
    const today = formatLocalDate(new Date());
    const hasTodayReport = (data.dailyReports || []).some((report) => normalizeDateText(report.ReportDate) === today);
    const refreshKey = \`${token}:${today}\`;
    if (!hasTodayReport && dailyReportRefreshKeyRef.current !== refreshKey) {
      dailyReportRefreshKeyRef.current = refreshKey;
      refresh();
    }
  }, [token, data, view]);
`,
    'daily report auto refresh effect'
  );
}

app = app.replace(
  `  useEffect(() => {
    if (!selectedDate && availableDates[0]) setSelectedDate(availableDates[0]);
  }, [availableDates, selectedDate]);`,
  `  useEffect(() => {
    if (selectedDate && !availableDates.includes(selectedDate)) setSelectedDate('');
  }, [availableDates, selectedDate]);`
);

fs.writeFileSync(appPath, app, 'utf8');
fs.writeFileSync(apiPath, api, 'utf8');
