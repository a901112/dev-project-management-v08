import fs from 'node:fs';
import './patch-v62-task-duplicate-guard.mjs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('function normalizeDateText(')) {
  if (!app.includes('function truthySheetValue(')) {
    throw new Error('patch-v61 marker not found: date normalizer insertion point');
  }

  app = app.replace(
    'function truthySheetValue(value: string) {',
    `function normalizeDateText(value: string) {
  const parsed = parseLocalDate(value);
  return parsed ? formatLocalDate(parsed) : String(value || '').slice(0, 10);
}

function truthySheetValue(value: string) {`
  );
}

fs.writeFileSync(appPath, app, 'utf8');
