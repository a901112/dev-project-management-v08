import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const staleCacheGuard = `  useEffect(() => {
    if (token) {
      if (!data) refresh();
      setReadNotificationIds(loadReadNotifications(token));
    }
  }, [token]);`;

const backgroundRefresh = `  useEffect(() => {
    if (token) {
      refresh();
      setReadNotificationIds(loadReadNotifications(token));
    }
  }, [token]);`;

if (app.includes(staleCacheGuard)) {
  app = app.replace(staleCacheGuard, backgroundRefresh);
} else if (!app.includes(backgroundRefresh)) {
  throw new Error('patch-v66: cached app-data startup guard not found');
}

fs.writeFileSync(appPath, app, 'utf8');
