import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const legacy = "const activeCount = rows.filter((row) => !isProjectClosed(row.project)).length;";
const fixed = "const activeCount = rows.filter((row) => row.health.tone === 'info').length;";

let source = fs.readFileSync(appPath, 'utf8');
if (source.includes(legacy)) {
  source = source.replace(legacy, fixed);
  fs.writeFileSync(appPath, source);
  console.log('patch-v41-project-summary-counts applied');
} else if (source.includes(fixed)) {
  console.log('patch-v41-project-summary-counts already applied');
} else {
  throw new Error('Project summary count target not found.');
}
