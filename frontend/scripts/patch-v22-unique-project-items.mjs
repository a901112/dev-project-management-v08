import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  /function splitItemCodes\(value: string\) \{[\s\S]*?\n\}/,
  `function splitItemCodes(value: string) {
  return String(value || '').split(/[\\/、,，\\s]+/).map((item) => item.trim()).filter(Boolean);
}`
);

if (!app.includes('function duplicateProjectItemMessage')) {
  app = app.replace(
    /function projectOrderLines\(project: Project, orderLines: ErpOrderLine\[\]\) \{/,
    `function duplicateProjectItemMessage(projects: Project[], itemCodes: string, currentProjectId = '') {
  const items = Array.from(new Set(splitItemCodes(itemCodes).map(normalizeProjectItemCode).filter(Boolean)));
  if (items.length === 0) return '';
  const itemSet = new Set(items);
  for (const project of projects) {
    if (String(project.ProjectId) === String(currentProjectId)) continue;
    const duplicate = splitItemCodes(project.ItemCodes).map(normalizeProjectItemCode).find((item) => itemSet.has(item));
    if (duplicate) return \`專案品項不可重複：\${duplicate} 已存在於 \${project.ProjectCode || '未編碼專案'} / \${project.ProjectName || ''}。\`;
  }
  return '';
}

function normalizeProjectItemCode(value: string) {
  return String(value || '').trim().toUpperCase();
}

function projectOrderLines(project: Project, orderLines: ErpOrderLine[]) {`
  );
}

if (!app.includes('const duplicateMessage = duplicateProjectItemMessage')) {
  app = app.replace(
    `      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      let next: AppData;`,
    `      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (modal.type === 'project' || modal.type === 'projectEdit') {
        const duplicateMessage = duplicateProjectItemMessage(
          data.projects,
          String(payload.ItemCodes || ''),
          modal.type === 'projectEdit' ? modal.project.ProjectId : ''
        );
        if (duplicateMessage) throw new Error(duplicateMessage);
      }
      let next: AppData;`
  );
}

fs.writeFileSync(appPath, app);
