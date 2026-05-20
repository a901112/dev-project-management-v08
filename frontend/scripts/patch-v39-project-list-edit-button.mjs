import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const editButton = `{canManageProjects(data.currentUser) && <button className="light" onClick={() => setModal({ type: 'projectEdit', project })}>編輯</button>}`;

if (!app.includes(editButton)) {
  const rowActionsPattern =
    /<span className="row-actions">([\s\S]*?<button className="light" onClick=\{\(\) => openProject\(project\)\}>[\s\S]*?<\/button>)([\s\S]*?<button className="light" onClick=\{\(\) => setModal\(\{ type: 'task', project \}\)\}>[\s\S]*?<\/button>)<\/span>/;

  if (!rowActionsPattern.test(app)) {
    throw new Error('Unable to locate project list row actions for edit button patch.');
  }

  app = app.replace(
    rowActionsPattern,
    `<span className="row-actions">
              $1
              ${editButton}
              $2
            </span>`
  );
}

fs.writeFileSync(appPath, app);
