import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

[
  '{"\\\\n          "}',
  '{"\\n          "}',
  '"\\\\n          ",',
  ',"\\\\n          "',
  "'\\\\n          ',",
  ",'\\\\n          '"
].forEach((pattern) => {
  app = app.replaceAll(pattern, '');
});

app = app.replace(/,\s*["']\\\\n\s*["']\s*,/g, ',');
app = app.replace(/\{\s*["']\\\\n\s*["']\s*\}/g, '');

fs.writeFileSync(appPath, app);
