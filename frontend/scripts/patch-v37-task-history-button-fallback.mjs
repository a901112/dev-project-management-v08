import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace('setModal && history.length > 0 && (', 'setModal && (');

const from = `function getTaskHistory(data: AppData, task: Task): TaskHistoryItem[] {
  return (data.transitions || [])
    .filter((item) => String(item.TaskId || '') === String(task.TaskId || ''))
    .sort((a, b) => String(a.CreatedAt || '').localeCompare(String(b.CreatedAt || '')))
    .map((item) => ({ ...item, ActionLabel: taskActionLabel(item.Action || '') }));
}`;

const to = `function getTaskHistory(data: AppData, task: Task): TaskHistoryItem[] {
  const history = (data.transitions || [])
    .filter((item) => String(item.TaskId || '') === String(task.TaskId || ''))
    .sort((a, b) => String(a.CreatedAt || '').localeCompare(String(b.CreatedAt || '')))
    .map((item) => ({ ...item, ActionLabel: taskActionLabel(item.Action || '') }));
  if (history.length) return history;
  return [{
    TaskId: task.TaskId,
    FromStatus: '',
    ToStatus: task.TaskStatus || '',
    FromResult: '',
    ToResult: task.TaskResult || '',
    Action: 'Current',
    ActionLabel: '目前狀態',
    Note: task.ResultReason || task.Description || '',
    UserEmail: task.AssigneeEmail || task.AssignedByEmail || '',
    CreatedAt: task.UpdatedAt || task.CreatedAt || ''
  }];
}`;

app = app.replace(from, to);
fs.writeFileSync(appPath, app);
