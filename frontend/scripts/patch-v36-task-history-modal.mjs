import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

if (!app.includes('MessageSquareText')) {
  app = replaceOnce(
    app,
    `import { Bell, CheckCircle2, ClipboardList, Eye, FolderKanban, LogOut, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';`,
    `import { Bell, CheckCircle2, ClipboardList, Eye, FolderKanban, LogOut, MessageSquareText, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';`
  );
}

if (!app.includes(`| { type: 'history'; task: Task }`)) {
  app = replaceOnce(
    app,
    `  | { type: 'edit'; task: Task }
  | { type: 'void'; task: Task }
  | null;`,
    `  | { type: 'edit'; task: Task }
  | { type: 'void'; task: Task }
  | { type: 'history'; task: Task }
  | null;`
  );
}

app = replaceOnce(
  app,
  `<span><Status status={task.TaskStatus} /><small>{task.TaskResult}{task.ResultReason ? \` / \${task.ResultReason}\` : ''}</small></span>`,
  `<span><Status status={task.TaskStatus} /><TaskLatestSummary data={data} task={task} setModal={setModal} /></span>`
);

app = app.replace(
  /<span>[^<]*\{task\.TaskResult\}\{task\.ResultReason \? ` \/ \$\{task\.ResultReason\}` : ''\}<\/span>/,
  `<span className="task-latest-block"><TaskLatestSummary data={data} task={task} setModal={setModal} /></span>`
);

if (!app.includes('function TaskLatestSummary(')) {
  app = replaceOnce(
    app,
    `function ProjectLink({ data, task, openProject, inline = false }: { data: AppData; task: Task; openProject?: (project: Project) => void; inline?: boolean }) {`,
    `function TaskLatestSummary({ data, task, setModal }: { data: AppData; task: Task; setModal?: (modal: ModalState) => void }) {
  const history = getTaskHistory(data, task);
  const latest = history[history.length - 1];
  const result = latest?.ToResult || task.TaskResult || '';
  const note = latest?.Note || task.ResultReason || '';
  const title = result || latest?.ActionLabel || '未回報';
  return (
    <small className="task-latest-summary">
      <span className="task-latest-text">{title}{note ? \` / \${compactText(note, 34)}\` : ''}</span>
      {setModal && history.length > 0 && (
        <button className="history-link" onClick={() => setModal({ type: 'history', task })}>
          <MessageSquareText size={13} /> 歷程 {history.length}
        </button>
      )}
    </small>
  );
}

function ProjectLink({ data, task, openProject, inline = false }: { data: AppData; task: Task; openProject?: (project: Project) => void; inline?: boolean }) {`
  );
}

if (!app.includes(`if (modal.type === 'history')`)) {
  app = replaceOnce(
    app,
    `  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {`,
    `  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (modal.type === 'history') {
    const history = getTaskHistory(data, modal.task);
    return (
      <div className="modal-backdrop">
        <section className="modal history-modal">
          <div className="modal-head"><h3>任務歷程</h3><button className="light" onClick={close}>關閉</button></div>
          <div className="history-task-head">
            <strong>{modal.task.TaskCode}</strong>
            <span>{modal.task.TaskName}</span>
          </div>
          {history.length === 0 ? (
            <div className="empty">尚無歷程紀錄</div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article className="history-item" key={item.TransitionId || \`\${item.TaskId}-\${item.CreatedAt}-\${item.Action}\`}>
                  <div className="history-time">{item.CreatedAt || '-'}</div>
                  <div className="history-body">
                    <div className="history-title">
                      <strong>{item.ActionLabel}</strong>
                      <span>{displayUser(data, item.UserEmail || '')}</span>
                    </div>
                    <div className="history-state">{[item.FromStatus, item.FromResult].filter(Boolean).join(' / ') || '-'} → {[item.ToStatus, item.ToResult].filter(Boolean).join(' / ') || '-'}</div>
                    {item.Note && <p>{item.Note}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {`
  );
}

app = replaceOnce(
  app,
  `function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.type === 'project') return '新增專案';`,
  `function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.type === 'history') return '任務歷程';
  if (modal.type === 'project') return '新增專案';`
);

if (!app.includes('type TaskHistoryItem')) {
  app = replaceOnce(
    app,
    `function filterTasks(tasks: Task[], filters: { keyword: string; statusFilter: string; assigneeFilter: string; projectFilter: string }, data: AppData) {`,
    `type TaskHistoryItem = Record<string, string> & { ActionLabel: string };

function getTaskHistory(data: AppData, task: Task): TaskHistoryItem[] {
  return (data.transitions || [])
    .filter((item) => String(item.TaskId || '') === String(task.TaskId || ''))
    .sort((a, b) => String(a.CreatedAt || '').localeCompare(String(b.CreatedAt || '')))
    .map((item) => ({ ...item, ActionLabel: taskActionLabel(item.Action || '') }));
}

function taskActionLabel(action: string) {
  const labels: Record<string, string> = {
    CreateTask: '建立任務',
    complete: '回報完成',
    rejected: '回報未通過',
    blocked: '回報異常',
    approve: '覆判完成',
    return: '退回',
    close: '結案',
    CreateFollowUpTask: '建立後續任務',
    EditTask: '編輯任務',
    VoidTask: '作廢任務'
  };
  return labels[action] || action || '更新';
}

function compactText(text: string, limit: number) {
  const normalized = String(text || '').replace(/\\s+/g, ' ').trim();
  return normalized.length > limit ? \`\${normalized.slice(0, limit)}...\` : normalized;
}

function filterTasks(tasks: Task[], filters: { keyword: string; statusFilter: string; assigneeFilter: string; projectFilter: string }, data: AppData) {`
  );
}

if (!styles.includes('.task-latest-summary')) {
  styles = replaceOnce(
    styles,
    `.status.done { background: #1f7a4d; }
.status.review { background: #a35f00; }
.status.returned { background: #a23b3b; }
.status.closed { background: #59636f; }
.danger-text { color: #a23b3b; }`,
    `.status.done { background: #1f7a4d; }
.status.review { background: #a35f00; }
.status.returned { background: #a23b3b; }
.status.closed { background: #59636f; }
.danger-text { color: #a23b3b; }
.task-latest-summary {
  display: grid;
  gap: 5px;
  margin-top: 5px;
  color: #52616b;
  line-height: 1.35;
}
.task-latest-text {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.task-latest-block {
  grid-column: 1 / -1;
}
.history-link {
  width: fit-content;
  border: 0;
  padding: 0;
  color: #245b74;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.history-link:hover {
  text-decoration: underline;
}`
  );
}

if (!styles.includes('.history-modal')) {
  styles = replaceOnce(
    styles,
    `@media (max-width: 1180px) {`,
    `.history-modal {
  width: min(860px, calc(100vw - 32px));
}
.history-task-head {
  display: grid;
  gap: 4px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}
.history-task-head span {
  color: #52616b;
}
.history-list {
  display: grid;
  gap: 10px;
  max-height: 62vh;
  overflow: auto;
  padding-right: 4px;
}
.history-item {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}
.history-time {
  color: #718096;
  font-size: 12px;
  line-height: 1.45;
}
.history-body {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.history-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.history-title span,
.history-state {
  color: #52616b;
  font-size: 12px;
}
.history-body p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}

@media (max-width: 1180px) {`
  );
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
