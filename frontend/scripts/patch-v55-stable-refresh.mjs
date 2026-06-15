import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v55 marker not found: ${label}`);
  return source.replace(from, to);
}

api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false }),",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false }),"
);

if (!app.includes('refreshSeqRef')) {
  app = replaceRequired(
    app,
    "import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';",
    "import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';",
    'React useRef import'
  );

  app = replaceRequired(
    app,
    `  const [myTaskFilters, setMyTaskFilters] = useState<MyTaskFiltersState>(emptyMyTaskFilters);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);`,
    `  const [myTaskFilters, setMyTaskFilters] = useState<MyTaskFiltersState>(emptyMyTaskFilters);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const refreshSeqRef = useRef(0);`,
    'refresh state'
  );

  app = replaceRequired(
    app,
    `  useEffect(() => {
    if (token) {
      refresh();
      setReadNotificationIds(loadReadNotifications(token));
    }
  }, [token]);`,
    `  useEffect(() => {
    if (token) {
      if (!data) refresh();
      setReadNotificationIds(loadReadNotifications(token));
    }
  }, [token]);`,
    'initial refresh guard'
  );

  app = replaceRequired(
    app,
    `  async function refresh() {
    try {
      setError('');
      const next = await api.getAppData(token);
      setData(next);
      saveCachedAppData(token, next);
      setUser(next.currentUser);
      localStorage.setItem(userKey, JSON.stringify(next.currentUser));
    } catch (err) {
      setError(errorMessage(err));
    }
  }`,
    `  async function refresh() {
    if (refreshing) return;
    const seq = refreshSeqRef.current + 1;
    refreshSeqRef.current = seq;
    setRefreshing(true);
    try {
      setError('');
      const next = await api.getAppData(token);
      if (refreshSeqRef.current !== seq) return;
      setData(next);
      saveCachedAppData(token, next);
      setUser(next.currentUser);
      localStorage.setItem(userKey, JSON.stringify(next.currentUser));
    } catch (err) {
      if (refreshSeqRef.current === seq) setError(errorMessage(err));
    } finally {
      if (refreshSeqRef.current === seq) setRefreshing(false);
    }
  }`,
    'stable refresh function'
  );

  app = app.replace(
    `<button className="light" onClick={refresh}><RefreshCw size={16} />重新整理</button>`,
    `<button className="light" onClick={refresh} disabled={refreshing}><RefreshCw size={16} />{refreshing ? '整理中...' : '重新整理'}</button>`
  );

  app = app.replace(
    `<button className="light" onClick={refresh}><RefreshCw size={16} />??渡?</button>`,
    `<button className="light" onClick={refresh} disabled={refreshing}><RefreshCw size={16} />{refreshing ? '整理中...' : '重新整理'}</button>`
  );
}

fs.writeFileSync(appPath, app, 'utf8');
fs.writeFileSync(apiPath, api, 'utf8');
