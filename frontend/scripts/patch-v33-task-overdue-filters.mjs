import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

if (!app.includes('type MyTaskFiltersState')) {
  app = replaceOnce(app, `type ProjectFiltersState = {
  keyword: string;
  status: string;
  stages: string[];
  health: string;
  owner: string;
};
`, `type ProjectFiltersState = {
  keyword: string;
  status: string;
  stages: string[];
  health: string;
  owner: string;
};

type MyTaskFiltersState = {
  keyword: string;
  status: string;
  project: string;
  taskType: string;
};
`);
}

app = replaceOnce(
  app,
  `const emptyProjectFilters: ProjectFiltersState = { keyword: '', status: '', stages: [], health: '', owner: '' };`,
  `const emptyProjectFilters: ProjectFiltersState = { keyword: '', status: '', stages: [], health: '', owner: '' };
const emptyMyTaskFilters: MyTaskFiltersState = { keyword: '', status: 'unfinished', project: '', taskType: '' };`
);

app = replaceOnce(
  app,
  `  const [projectFilter, setProjectFilter] = useState('');
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);`,
  `  const [projectFilter, setProjectFilter] = useState('');
  const [myTaskFilters, setMyTaskFilters] = useState<MyTaskFiltersState>(emptyMyTaskFilters);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);`
);

app = replaceOnce(
  app,
  `  const myTasks = data.tasks.filter((task) => sameEmail(task.AssigneeEmail, user.Email) && unfinishedStatuses.includes(task.TaskStatus));`,
  `  const myBaseTasks = data.tasks.filter((task) => sameEmail(task.AssigneeEmail, user.Email));
  const myTasks = filterMyTasks(myBaseTasks, myTaskFilters, data);`
);

app = replaceOnce(
  app,
  `          <h2>我的任務</h2>
          <HelpCards mode="assignee" />`,
  `          <h2>我的任務</h2>
          <MyTaskFilters data={data} tasks={myBaseTasks} filters={myTaskFilters} setFilters={setMyTaskFilters} />
          <HelpCards mode="assignee" />`
);

app = replaceOnce(
  app,
  `          <option value="unfinished">未完成</option>
          <option value="all">全部</option>`,
  `          <option value="unfinished">未完成</option>
          <option value="overdue">逾期</option>
          <option value="all">全部</option>`
);

if (!app.includes('function MyTaskFilters(')) {
  app = replaceOnce(app, `function TaskTable({ data, tasks, user, setModal, openProject, compact = false }: { data: AppData; tasks: Task[]; user: User; setModal?: (modal: ModalState) => void; openProject?: (project: Project) => void; compact?: boolean }) {`, `function MyTaskFilters({ data, tasks, filters, setFilters }: { data: AppData; tasks: Task[]; filters: MyTaskFiltersState; setFilters: (filters: MyTaskFiltersState) => void }) {
  const update = (key: keyof MyTaskFiltersState, value: string) => setFilters({ ...filters, [key]: value });
  const projectOptions = data.projects
    .filter((project) => tasks.some((task) => task.ProjectCode === project.ProjectCode || String(task.ProjectId) === String(project.ProjectId)))
    .sort((a, b) => String(a.ProjectCode).localeCompare(String(b.ProjectCode)));
  return (
    <div className="filter-panel my-task-filter-panel">
      <label><Search size={14} />關鍵字<input value={filters.keyword} onChange={(event) => update('keyword', event.target.value)} placeholder="任務、專案、交辦人" /></label>
      <label>狀態
        <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="unfinished">未完成</option>
          <option value="overdue">逾期</option>
          <option value="all">全部</option>
          <option value={STATUS_IN_PROGRESS}>進行中</option>
          <option value={STATUS_RETURNED}>已退回</option>
          <option value={STATUS_PENDING}>待覆判</option>
          <option value={STATUS_COMPLETED}>已完成</option>
          <option value="closed">已結案 / 作廢</option>
        </select>
      </label>
      <label>專案
        <select value={filters.project} onChange={(event) => update('project', event.target.value)}>
          <option value="">全部</option>
          {projectOptions.map((project) => <option key={project.ProjectId} value={project.ProjectCode}>{project.ProjectCode}</option>)}
        </select>
      </label>
      <label>類型
        <select value={filters.taskType} onChange={(event) => update('taskType', event.target.value)}>
          <option value="">全部</option>
          {data.taskTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <button className="light filter-reset" onClick={() => setFilters(emptyMyTaskFilters)}>清除篩選</button>
    </div>
  );
}

function TaskTable({ data, tasks, user, setModal, openProject, compact = false }: { data: AppData; tasks: Task[]; user: User; setModal?: (modal: ModalState) => void; openProject?: (project: Project) => void; compact?: boolean }) {`);
}

app = replaceOnce(
  app,
  `    if (filters.statusFilter === 'unfinished' && !unfinishedStatuses.includes(task.TaskStatus)) return false;
    if (filters.statusFilter === 'closed' && ![STATUS_CLOSED, STATUS_VOIDED].includes(task.TaskStatus)) return false;
    if (!['all', 'unfinished', 'closed'].includes(filters.statusFilter) && task.TaskStatus !== filters.statusFilter) return false;`,
  `    if (filters.statusFilter === 'unfinished' && !unfinishedStatuses.includes(task.TaskStatus)) return false;
    if (filters.statusFilter === 'overdue' && !isOverdue(task)) return false;
    if (filters.statusFilter === 'closed' && ![STATUS_CLOSED, STATUS_VOIDED].includes(task.TaskStatus)) return false;
    if (!['all', 'unfinished', 'overdue', 'closed'].includes(filters.statusFilter) && task.TaskStatus !== filters.statusFilter) return false;`
);

if (!app.includes('function filterMyTasks(')) {
  app = replaceOnce(app, `function getNotifications(data: AppData, user: User) {`, `function filterMyTasks(tasks: Task[], filters: MyTaskFiltersState, data: AppData) {
  const keyword = filters.keyword.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.status === 'unfinished' && !unfinishedStatuses.includes(task.TaskStatus)) return false;
    if (filters.status === 'overdue' && !isOverdue(task)) return false;
    if (filters.status === 'closed' && ![STATUS_CLOSED, STATUS_VOIDED].includes(task.TaskStatus)) return false;
    if (!['all', 'unfinished', 'overdue', 'closed'].includes(filters.status) && task.TaskStatus !== filters.status) return false;
    if (filters.project && task.ProjectCode !== filters.project) return false;
    if (filters.taskType && task.TaskType !== filters.taskType) return false;
    if (!keyword) return true;
    return [
      task.TaskCode,
      task.TaskName,
      task.TaskType,
      task.ProjectCode,
      projectName(data, task.ProjectId),
      task.AssignedByEmail,
      task.TaskResult,
      task.ResultReason
    ].some((value) => String(value || '').toLowerCase().includes(keyword));
  });
}

function getNotifications(data: AppData, user: User) {`);
}

if (!styles.includes('.my-task-filter-panel')) {
  styles = replaceOnce(
    styles,
    `.task-filter-panel { grid-template-columns: 1.4fr repeat(3, minmax(130px, 1fr)); }`,
    `.task-filter-panel { grid-template-columns: 1.4fr repeat(3, minmax(130px, 1fr)); }
.my-task-filter-panel { grid-template-columns: 1.35fr minmax(130px, 0.75fr) minmax(160px, 0.9fr) minmax(170px, 1fr) auto; align-items: end; }`
  );
}

styles = replaceOnce(
  styles,
  `.metric-grid, .project-summary-grid, .task-filter-panel, .project-filter-panel, .help-grid, .field-grid, .field-grid.compact, .project-form-grid { grid-template-columns: 1fr; }`,
  `.metric-grid, .project-summary-grid, .task-filter-panel, .my-task-filter-panel, .project-filter-panel, .help-grid, .field-grid, .field-grid.compact, .project-form-grid { grid-template-columns: 1fr; }`
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
