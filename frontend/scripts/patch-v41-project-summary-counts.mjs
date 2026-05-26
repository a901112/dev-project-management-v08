import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);

const replacements = [
  {
    legacy: "const activeCount = rows.filter((row) => !isProjectClosed(row.project)).length;",
    fixed: "const activeCount = rows.filter((row) => row.health.tone === 'info').length;"
  },
  {
    legacy: "const riskCount = rows.filter((row) => ['danger', 'warn'].includes(row.health.tone)).length;",
    fixed: "const riskCount = rows.filter((row) => ['danger', 'warn', 'notice'].includes(row.health.tone)).length;"
  }
];

let source = fs.readFileSync(appPath, 'utf8');
let changed = false;
for (const { legacy, fixed } of replacements) {
  if (source.includes(legacy)) {
    source = source.replace(legacy, fixed);
    changed = true;
  } else if (!source.includes(fixed)) {
    throw new Error(`Project summary count target not found: ${legacy}`);
  }
}

if (changed) {
  fs.writeFileSync(appPath, source);
  console.log('patch-v41-project-summary-counts applied');
} else {
  console.log('patch-v41-project-summary-counts already applied');
}
