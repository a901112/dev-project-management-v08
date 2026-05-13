import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replaceAll('<span>\u9032\u5ea6</span>', '<span>\u4e3b\u968e\u6bb5</span>');

fs.writeFileSync(appPath, app);
