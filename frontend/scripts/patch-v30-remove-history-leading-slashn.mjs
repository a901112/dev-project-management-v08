import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replaceAll('\\n          <ProjectHistoryPanel', '<ProjectHistoryPanel');
app = app.replaceAll('\\\\n          <ProjectHistoryPanel', '<ProjectHistoryPanel');
app = app.replaceAll('>\\n          <ProjectHistoryPanel', '><ProjectHistoryPanel');
app = app.replaceAll('>\\\\n          <ProjectHistoryPanel', '><ProjectHistoryPanel');

fs.writeFileSync(appPath, app);
