import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  /<button className="primary" onClick=\{\(\) => setModal\(\{ type: 'project' \}\)\}><Plus size=\{16\} \/>[^<]*<\/button>/,
  "{canManageProjects(data.currentUser) && <button className=\"primary\" onClick={() => setModal({ type: 'project' })}><Plus size={16} />新增專案</button>}"
);

app = app.replace(
  /const editable = canReview\(user, task\) && \[STATUS_IN_PROGRESS, STATUS_RETURNED\]\.includes\(task\.TaskStatus\);/,
  "const editable = canEditTask(user, task) && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus);"
);

if (!app.includes('function canManageProjects')) {
  app = app.replace(
    /function Metric\(\{ label, value, tone = '' \}: \{ label: string; value: number; tone\?: string \}\) \{/,
    `function canManageProjects(user: User) {
  const account = String(user.Account || '').trim().toLowerCase();
  return user.Role === 'PM' || account === 'mis';
}

function canEditTask(user: User, task: Task) {
  return canManageProjects(user) || sameEmail(task.AssignedByEmail, user.Email);
}

function Metric({ label, value, tone = '' }: { label: string; value: number; tone?: string }) {`
  );
}

fs.writeFileSync(appPath, app);
