import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceIfPresent(from, to) {
  if (app.includes(to)) return;
  if (app.includes(from)) app = app.replace(from, to);
}

replaceIfPresent(
  "const userKey = 'pm-v08-user';",
  "const userKey = 'pm-v08-user';\nconst dataCacheKeyPrefix = 'pm-v08-app-data';"
);

replaceIfPresent(
  "  const [data, setData] = useState<AppData | null>(null);",
  "  const [data, setData] = useState<AppData | null>(() => token ? loadCachedAppData(token) : null);"
);

replaceIfPresent(
  "      setData(next);\n      setUser(next.currentUser);",
  "      setData(next);\n      saveCachedAppData(token, next);\n      setUser(next.currentUser);"
);

replaceIfPresent(
  "    localStorage.removeItem(userKey);\n    setToken('');",
  "    localStorage.removeItem(userKey);\n    if (token) localStorage.removeItem(appDataCacheKey(token));\n    setToken('');"
);

if (!app.includes('function appDataCacheKey(token: string)')) {
  replaceIfPresent(
    "function errorMessage(error: unknown) {\n  return error instanceof Error ? error.message : String(error);\n}\n",
    "function appDataCacheKey(token: string) {\n  return `${dataCacheKeyPrefix}:${String(token || '').trim().toLowerCase()}`;\n}\n\nfunction loadCachedAppData(token: string): AppData | null {\n  try {\n    const value = localStorage.getItem(appDataCacheKey(token));\n    return value ? JSON.parse(value) as AppData : null;\n  } catch {\n    return null;\n  }\n}\n\nfunction saveCachedAppData(token: string, data: AppData) {\n  try {\n    localStorage.setItem(appDataCacheKey(token), JSON.stringify(data));\n  } catch {\n    // Cache is best effort; keep the app usable if browser storage is full.\n  }\n}\n\nfunction errorMessage(error: unknown) {\n  return error instanceof Error ? error.message : String(error);\n}\n"
  );
}

fs.writeFileSync(appPath, app, 'utf8');
