import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const newBlock = `function dailyTaskTitle(data: AppData, task: Task) {
  const project = findTaskProject(data, task);
  const source = [task.TaskName, project?.ProjectName, project?.ItemCodes, task.ProjectCode].filter(Boolean).join(' ');
  const itemNo = dailyBriefItemCode(source) || task.TaskCode;
  const rawName = String(project?.ProjectName || task.TaskName || '')
    .replace(itemNo, '')
    .replace(/\\[[^\\]]*\\]/g, '')
    .replace(/[()\\uFF08\\uFF09]/g, ' ')
    .trim();
  const shortName = compactText(rawName || task.TaskType || 'Task', 12);
  return itemNo ? \`\${itemNo}(\${shortName})\` : shortName;
}

function dailyBriefItemCode(source: string) {
  const text = String(source || '');
  const patterns = [
    /\\b[A-Z]{0,3}\\d{1,5}-\\d{2,6}[A-Z]{0,3}\\b/i,
    /\\b[A-Z]\\d{4,}[A-Z0-9-]*\\b/i,
    /\\b\\d{5,}[A-Z]?\\b/i,
    /\\b\\d{4,}[A-Z]?\\b/i
  ];
  return patterns.map((pattern) => text.match(pattern)?.[0]).find(Boolean) || '';
}`;

if (app.includes('function dailyBriefItemCode(')) {
  app = app.replace(/function dailyTaskTitle\(data: AppData, task: Task\) \{[\s\S]*?\n\}\n\nfunction dailyBriefItemCode\(source: string\) \{[\s\S]*?\n\}\n\nfunction startOfLocalDay/, `${newBlock}\n\nfunction startOfLocalDay`);
} else {
  app = app.replace(/function dailyTaskTitle\(data: AppData, task: Task\) \{[\s\S]*?\n\}\n\nfunction startOfLocalDay/, `${newBlock}\n\nfunction startOfLocalDay`);
}

fs.writeFileSync(appPath, app);
