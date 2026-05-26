import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);
const typesPath = new URL('../src/types.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');
let types = fs.readFileSync(typesPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v42 marker not found: ${label}`);
  return source.replace(from, to);
}

if (!types.includes('export type TaskWorkLog')) {
  types = replaceRequired(
    types,
    `export type AppData = {`,
    `export type TaskWorkLog = {
  WorkLogId: string;
  TaskId: string;
  TaskCode: string;
  ProjectId: string;
  ProjectCode: string;
  LogDate: string;
  LogType: string;
  ContactTarget: string;
  Content: string;
  NextFollowUpDate: string;
  Hours: string;
  CreatedByEmail: string;
  CreatedAt: string;
  UpdatedAt: string;
};

export type AppData = {`,
    'types TaskWorkLog insert'
  );
}

types = replaceOnce(
  types,
  `  erpOrderLines?: ErpOrderLine[];
  comments: Record<string, string>[];`,
  `  erpOrderLines?: ErpOrderLine[];
  workLogs?: TaskWorkLog[];
  comments: Record<string, string>[];`
);

types = replaceOnce(
  types,
  `  PendingReviewByMeTasks: number;
  Comments: number;`,
  `  PendingReviewByMeTasks: number;
  WorkLogs: number;
  Comments: number;`
);

api = replaceOnce(
  api,
  `  updateProjectPatch: (token: string, payload: Record<string, unknown>) => jsonp<Project>('updateProjectPatch', { ...payload, ActorEmail: token }),
  submitTaskResult: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('submitTaskResult', { ...payload, ActorEmail: token }),`,
  `  updateProjectPatch: (token: string, payload: Record<string, unknown>) => jsonp<Project>('updateProjectPatch', { ...payload, ActorEmail: token }),
  createTaskWorkLog: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('createTaskWorkLog', { ...payload, ActorEmail: token }),
  submitTaskResult: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('submitTaskResult', { ...payload, ActorEmail: token }),`
);

if (!app.includes('TaskWorkLog')) {
  app = replaceRequired(
    app,
    `import type { AppData, Project, Task, User } from './types';`,
    `import type { AppData, Project, Task, TaskWorkLog, User } from './types';`,
    'App type import'
  );
}

if (!app.includes(`| { type: 'workLog'; task: Task }`)) {
  app = replaceRequired(
    app,
    `  | { type: 'edit'; task: Task }
  | { type: 'void'; task: Task }`,
    `  | { type: 'edit'; task: Task }
  | { type: 'workLog'; task: Task }
  | { type: 'void'; task: Task }`,
    'ModalState workLog'
  );
}

if (!app.includes('const workLogTypes')) {
  app = replaceRequired(
    app,
    `const TASK_TYPE_SUPPLIER_QUOTE = '供應商估價';
`,
    `const TASK_TYPE_SUPPLIER_QUOTE = '供應商估價';
const workLogTypes = ['跟催', '等待外部', '已發出需求', '收到資料', '補充說明', '電話聯絡', 'Email紀錄', '其他'];
`,
    'workLogTypes'
  );
}

app = replaceOnce(
  app,
  `<article className="history-item" key={item.TransitionId || \`${item.TaskId}-${item.CreatedAt}-${item.Action}\`}>`,
  `<article className="history-item" key={item.TransitionId || item.WorkLogId || \`${item.TaskId}-${item.CreatedAt}-${item.Action}\`}>`
);

if (!app.includes(`setModal({ type: 'workLog', task })}><MessageSquareText size={14} />新增紀錄`)) {
  app = replaceRequired(
    app,
    `          <div className="actions">
            {mode === 'assignee' && canWorkOnTask(task) && (`,
    `          <div className="actions">
            {canLogWork(user, task) && <button className="light" onClick={() => setModal({ type: 'workLog', task })}><MessageSquareText size={14} />新增紀錄</button>}
            {mode === 'assignee' && canWorkOnTask(task) && (`,
    'TaskCards workLog button'
  );
}

if (!app.includes(`api.createTaskWorkLog`)) {
  app = replaceRequired(
    app,
    `      else if (modal.type === 'task') next = await api.createTask(token, { ...payload, ProjectId: payload.ProjectId || modal.project?.ProjectId });
      else if (modal.type === 'result') {`,
    `      else if (modal.type === 'task') next = await api.createTask(token, { ...payload, ProjectId: payload.ProjectId || modal.project?.ProjectId });
      else if (modal.type === 'workLog') next = await api.createTaskWorkLog(token, { ...payload, TaskId: modal.task.TaskId });
      else if (modal.type === 'result') {`,
    'ActionModal createTaskWorkLog'
  );
}

if (!app.includes(`modal.type === 'workLog' && <WorkLogFields`)) {
  app = replaceRequired(
    app,
    `          {modal.type === 'followUp' && <TaskFields data={data} sourceTask={modal.task} title={\`${modal.task.ResultReason || '任務異常'}，後續處理：${modal.task.TaskName}\`} />}
          {modal.type === 'void' && <label>作廢原因<input name="ResultReason" required /></label>}`,
    `          {modal.type === 'followUp' && <TaskFields data={data} sourceTask={modal.task} title={\`${modal.task.ResultReason || '任務異常'}，後續處理：${modal.task.TaskName}\`} />}
          {modal.type === 'workLog' && <WorkLogFields task={modal.task} />}
          {modal.type === 'void' && <label>作廢原因<input name="ResultReason" required /></label>}`,
    'ActionModal WorkLogFields'
  );
}

if (!app.includes('function WorkLogFields(')) {
  app = replaceRequired(
    app,
    `function actionButtons(task: Task, user: User, setModal: (modal: ModalState) => void) {`,
    `function WorkLogFields({ task }: { task: Task }) {
  return (
    <>
      <label>任務<input value={\`${task.TaskCode} / ${task.TaskName}\`} readOnly /></label>
      <label>紀錄類型
        <select name="LogType" defaultValue="跟催">
          {workLogTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <label>紀錄日期<input type="date" name="LogDate" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
      <label>對象<input name="ContactTarget" placeholder="供應商 / 客戶 / 內部人員，可空白" /></label>
      <label>下次跟催日<input type="date" name="NextFollowUpDate" /></label>
      <label>投入工時<input type="number" name="Hours" min="0" step="0.25" placeholder="選填" /></label>
      <label className="wide-field">工作內容<textarea name="Content" required placeholder="例如：已 Email 詢價給供應商，電話跟催後對方仍在確認。" /></label>
    </>
  );
}

function actionButtons(task: Task, user: User, setModal: (modal: ModalState) => void) {`,
    'WorkLogFields component'
  );
}

if (!app.includes(`setModal({ type: 'workLog', task })}>紀錄`)) {
  app = replaceRequired(
    app,
    `    <>
      {editable && <button className="light" onClick={() => setModal({ type: 'edit', task })}>編輯</button>}`,
    `    <>
      {canLogWork(user, task) && <button className="light" onClick={() => setModal({ type: 'workLog', task })}>紀錄</button>}
      {editable && <button className="light" onClick={() => setModal({ type: 'edit', task })}>編輯</button>}`,
    'row workLog button'
  );
}

if (!app.includes('function canLogWork(')) {
  app = replaceRequired(
    app,
    `function canEditTask(user: User, task: Task) {
  return canManageProjects(user) || sameEmail(task.AssignedByEmail, user.Email);
}

function normalizedStatus(task: Task) {`,
    `function canEditTask(user: User, task: Task) {
  return canManageProjects(user) || sameEmail(task.AssignedByEmail, user.Email);
}

function canLogWork(user: User, task: Task) {
  const closed = [STATUS_COMPLETED, STATUS_CLOSED, STATUS_VOIDED].includes(normalizedStatus(task));
  return !closed && (canManageProjects(user) || sameEmail(task.AssigneeEmail, user.Email) || sameEmail(task.AssignedByEmail, user.Email));
}

function normalizedStatus(task: Task) {`,
    'canLogWork'
  );
}

app = replaceOnce(
  app,
  `  if (modal.type === 'edit') return '編輯任務';
  if (modal.type === 'void') return '作廢任務';`,
  `  if (modal.type === 'edit') return '編輯任務';
  if (modal.type === 'workLog') return '新增工作紀錄';
  if (modal.type === 'void') return '作廢任務';`
);

if (!app.includes('const workLogs = (data.workLogs || [])')) {
  const historyBlock = `type TaskHistoryItem = Record<string, string> & { ActionLabel: string; Kind?: string };

function getTaskHistory(data: AppData, task: Task): TaskHistoryItem[] {
  const transitions = (data.transitions || [])
    .filter((item) => String(item.TaskId || '') === String(task.TaskId || ''))
    .map((item) => ({ ...item, ActionLabel: taskActionLabel(item.Action || '') }));
  const workLogs = (data.workLogs || [])
    .filter((item) => String(item.TaskId || '') === String(task.TaskId || ''))
    .map((item: TaskWorkLog) => ({
      TaskId: item.TaskId || task.TaskId,
      WorkLogId: item.WorkLogId || '',
      FromStatus: '',
      ToStatus: '',
      FromResult: '',
      ToResult: item.NextFollowUpDate ? \`下次跟催 ${item.NextFollowUpDate}\` : '',
      Action: 'WorkLog',
      ActionLabel: item.LogType || '工作紀錄',
      Note: [item.ContactTarget, item.Content].filter(Boolean).join(' / '),
      UserEmail: item.CreatedByEmail || '',
      CreatedAt: item.CreatedAt || item.LogDate || '',
      Kind: 'workLog'
    }));
  const history = [...transitions, ...workLogs]
    .sort((a, b) => String(a.CreatedAt || '').localeCompare(String(b.CreatedAt || '')));
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
}

function taskActionLabel`;
  const pattern = /type TaskHistoryItem = Record<string, string> & \{ ActionLabel: string \};\n\nfunction getTaskHistory\(data: AppData, task: Task\): TaskHistoryItem\[\] \{[\s\S]*?\n\}\n\nfunction taskActionLabel/;
  if (!pattern.test(app)) throw new Error('patch-v42 marker not found: getTaskHistory block');
  app = app.replace(pattern, historyBlock);
}

if (!app.includes(`WorkLog: '工作紀錄'`)) {
  app = replaceOnce(
    app,
    `    EditTask: '編輯任務',
    VoidTask: '作廢任務'`,
    `    EditTask: '編輯任務',
    VoidTask: '作廢任務',
    WorkLog: '工作紀錄'`
  );
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(apiPath, api);
fs.writeFileSync(typesPath, types);
