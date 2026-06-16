import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('function normalizeDateText(')) {
  if (app.includes('function normalizeReportDate(')) {
    app = app.replace(
      /function normalizeReportDate\(value: string\) \{\n  const parsed = parseLocalDate\(value\);\n  return parsed \? formatLocalDate\(parsed\) : String\(value \|\| ''\)\.slice\(0, 10\);\n\}/,
      `function normalizeReportDate(value: string) {
  const parsed = parseLocalDate(value);
  return parsed ? formatLocalDate(parsed) : String(value || '').slice(0, 10);
}

function normalizeDateText(value: string) {
  return normalizeReportDate(value);
}`
    );
  } else if (app.includes('function truthySheetValue(')) {
    app = app.replace(
      'function truthySheetValue(value: string) {',
      `function normalizeDateText(value: string) {
  const parsed = parseLocalDate(value);
  return parsed ? formatLocalDate(parsed) : String(value || '').slice(0, 10);
}

function truthySheetValue(value: string) {`
    );
  } else {
    throw new Error('patch-v61 marker not found: date normalizer insertion point');
  }
}

fs.writeFileSync(appPath, app, 'utf8');
