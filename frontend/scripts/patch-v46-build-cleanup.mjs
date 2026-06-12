import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const safeDuplicateLineFragments = [
  "const readNotificationsKeyPrefix = 'pm-v08-read-notifications';",
  "const emptyMyTaskFilters: MyTaskFiltersState = { keyword: '', status: 'unfinished', project: '', taskType: '' };",
  "  const orderLines = projectOrderLines(project, data.erpOrderLines || []);"
];

app = app
  .split(/\r?\n/)
  .filter((line, index, lines) => {
    if (index === 0 || line !== lines[index - 1]) return true;
    return !safeDuplicateLineFragments.includes(line);
  })
  .join('\n');

app = app.replace(
  /(  const \[myTaskFilters, setMyTaskFilters\] = useState<MyTaskFiltersState>\(emptyMyTaskFilters\);\n  const \[readNotificationIds, setReadNotificationIds\] = useState<string\[\]>\(\[\]\);)(?:\n\1)+/g,
  '$1'
);

app = app.replaceAll(
  `url.match(/drive.google.com/file/d/([^/]+)/) || url.match(/[?&]id=([^&]+)/)`,
  `url.match(/drive\\.google\\.com\\/file\\/d\\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)`
);

const nestedProjectButton = /\{canManageProjects\(data\.currentUser\) && \{canManageProjects\(data\.currentUser\) && (<button className="primary" onClick=\{\(\) => setModal\(\{ type: 'project' \}\)\}><Plus size=\{16\} \/>[^<]+<\/button>)\}\}/g;
let previousApp;
do {
  previousApp = app;
  app = app.replace(nestedProjectButton, '{canManageProjects(data.currentUser) && $1}');
} while (app !== previousApp);

fs.writeFileSync(appPath, app, 'utf8');
