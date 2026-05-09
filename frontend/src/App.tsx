import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Bell, CheckCircle2, ClipboardList, FolderKanban, LogOut, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { api } from './api';
import type { AppData, Project, Task, User } from './types';

type View = 'dashboard' | 'allTasks' | 'myTasks' | 'review' | 'projects' | 'users';
type ModalState =
  | { type: 'task'; project?: Project }
  | { type: 'project' }
  | { type: 'result'; task: Task; action: 'complete' | 'rejected' | 'blocked' }
  | { type: 'review'; task: Task; action: 'return' | 'close' }
  | { type: 'followUp'; task: Task }
  | { type: 'edit'; task: Task }
  | { type: 'void'; task: Task }
  | null;

const STATUS_IN_PROGRESS = '\u9032\u884c\u4e2d';
const STATUS_RETURNED = '\u5df2\u9000\u56de';
const STATUS_PENDING = '\u5f85\u8986\u5224';
const STATUS_COMPLETED = '\u5df2\u5b8c\u6210';
const STATUS_CLOSED = '\u5df2\u7d50\u6848';
const STATUS_VOIDED = '\u4f5c\u5ee2';
const RESULT_DONE = '\u5b8c\u6210';
const TASK_TYPE_SUPPLIER_QUOTE = '\u4f9b\u61c9\u5546\u4f30\u50f9';

const tokenKey = 'pm-v08-token';
const userKey = 'pm-v08-user';
const unfinishedStatuses = [STATUS_IN_PROGRESS, STATUS_RETURNED, STATUS_PENDING];

const navItems: Array<{ view: View; label: string; icon: typeof FolderKanban }> = [
  { view: 'dashboard', label: 'Dashboard', icon: Bell },
  { view: 'allTasks', label: 'Task List', icon: ClipboardList },
  { view: 'myTasks', label: 'My Tasks', icon: CheckCircle2 },
  { view: 'review', label: 'Review', icon: ShieldCheck },
  { view: 'projects', label: 'Projects', icon: FolderKanban },
  { view: 'users', label: 'Users', icon: ShieldCheck }
];

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '');
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : null;
  });
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [modal, setModal] = useState<ModalState>(null);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('unfinished');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => {
    if (token) refresh();
  }, [token]);

  async function refresh() {
    try {
      setError('');
      const next = await api.getAppData(token);
      setData(next);
      setUser(next.currentUser);
      localStorage.setItem(userKey, JSON.stringify(next.currentUser));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken('');
    setUser(null);
    setData(null);
  }

  if (!token || !user) {
    return <Login onLogin={(loginToken, loginUser) => {
      localStorage.setItem(tokenKey, loginToken);
      localStorage.setItem(userKey, JSON.stringify(loginUser));
      setToken(loginToken);
      setUser(loginUser);
    }} />;
  }

  if (!data) {
    return <Shell user={user} view={view} setView={setView} logout={logout}><section className="content">Loading...</section></Shell>;
  }

  const notifications = getNotifications(data, user);
  const allTasks = filterTasks(data.tasks, { keyword, statusFilter, assigneeFilter, projectFilter }, data);
  const myTasks = data.tasks.filter((task) => sameEmail(task.AssigneeEmail, user.Email) && unfinishedStatuses.includes(task.TaskStatus));
  const reviewTasks = data.tasks.filter((task) => task.TaskStatus === STATUS_PENDING && canReview(user, task));

  return (
    <Shell user={user} view={view} setView={setView} logout={logout} notificationCount={notifications.length}>
      <header className="topbar">
        <div>
          <strong>{user.DisplayName}</strong>
          <span>{user.Role} / {user.Email}</span>
        </div>
        <button className="light" onClick={refresh}><RefreshCw size={16} />Refresh</button>
      </header>
      {error && <div className="content"><div className="error">{error}</div></div>}
      {view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} setView={setView} />}
      {view === 'allTasks' && (
        <section className="content">
          <div className="section-heading">
            <h2>Task List</h2>
            <button className="primary" onClick={() => setModal({ type: 'task' })}><Plus size={16} />New Task</button>
          </div>
          <TaskFilters
            data={data}
            keyword={keyword}
            setKeyword={setKeyword}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
          />
          <TaskTable data={data} tasks={allTasks} user={user} setModal={setModal} />
        </section>
      )}
      {view === 'myTasks' && (
        <section className="content">
          <h2>My Tasks</h2>
          <HelpCards mode="assignee" />
          <TaskCards data={data} tasks={myTasks} user={user} mode="assignee" setModal={setModal} applyData={setData} token={token} />
        </section>
      )}
      {view === 'review' && (
        <section className="content">
          <h2>Review Queue</h2>
          <HelpCards mode="review" />
          <TaskCards data={data} tasks={reviewTasks} user={user} mode="review" setModal={setModal} applyData={setData} token={token} />
        </section>
      )}
      {view === 'projects' && <Projects data={data} setModal={setModal} />}
      {view === 'users' && <Users data={data} />}
      {modal && <ActionModal modal={modal} data={data} token={token} close={() => setModal(null)} applyData={setData} />}
    </Shell>
  );
}

function Login({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setError('');
      const result = await api.login(account, password);
      onLogin(result.token, result.user);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div className="login-title">
          <FolderKanban size={34} />
          <div>
            <h1>Project Management</h1>
            <p>V0.8 trial operation</p>
          </div>
        </div>
        <label>Account<input value={account} onChange={(event) => setAccount(event.target.value)} autoFocus /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary">Login</button>
        <p className="muted">Trial accounts are maintained in the Users sheet.</p>
      </form>
    </main>
  );
}

function Shell({ user, view, setView, logout, notificationCount = 0, children }: {
  user: User;
  view: View;
  setView: (view: View) => void;
  logout: () => void;
  notificationCount?: number;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <FolderKanban size={26} />
          <div><strong>Project System</strong><span>V0.8</span></div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.view} className={view === item.view ? 'active' : ''} onClick={() => setView(item.view)}>
                <Icon size={18} />{item.label}
                {item.view === 'dashboard' && notificationCount > 0 && <em className="nav-badge">{notificationCount}</em>}
              </button>
            );
          })}
        </nav>
        <div className="signed-user">
          <strong>{user.DisplayName}</strong>
          <span>{user.Role}</span>
        </div>
        <button className="logout" onClick={logout}><LogOut size={18} />Logout</button>
      </aside>
      <main>{children}</main>
    </div>
  );
}

function Dashboard({ data, user, notifications, setView }: { data: AppData; user: User; notifications: Task[]; setView: (view: View) => void }) {
  const myOpen = data.tasks.filter((task) => sameEmail(task.AssigneeEmail, user.Email) && unfinishedStatuses.includes(task.TaskStatus));
  const pendingReview = data.tasks.filter((task) => task.TaskStatus === STATUS_PENDING && canReview(user, task));
  const overdue = myOpen.filter((task) => isOverdue(task));

  return (
    <section className="content">
      <h2>Dashboard</h2>
      <div className="metric-grid">
        <Metric label="My Open Tasks" value={myOpen.length} />
        <Metric label="Pending Review" value={pendingReview.length} />
        <Metric label="Overdue" value={overdue.length} tone={overdue.length ? 'bad' : ''} />
        <Metric label="Alerts" value={notifications.length} tone={notifications.length ? 'warn' : ''} />
      </div>
      <div className="section-heading">
        <h3><Bell size={18} />Login Alerts</h3>
        <button className="light" onClick={() => setView('allTasks')}>Open Task List</button>
      </div>
      <TaskTable data={data} tasks={notifications.slice(0, 8)} user={user} compact />
    </section>
  );
}

function TaskFilters(props: {
  data: AppData;
  keyword: string;
  setKeyword: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
}) {
  return (
    <div className="filter-panel">
      <label><Search size={14} />Keyword<input value={props.keyword} onChange={(event) => props.setKeyword(event.target.value)} placeholder="Task, project, user" /></label>
      <label>Status
        <select value={props.statusFilter} onChange={(event) => props.setStatusFilter(event.target.value)}>
          <option value="unfinished">Unfinished</option>
          <option value="all">All</option>
          <option value={STATUS_IN_PROGRESS}>In progress</option>
          <option value={STATUS_PENDING}>Pending review</option>
          <option value={STATUS_RETURNED}>Returned</option>
          <option value={STATUS_COMPLETED}>Completed</option>
          <option value="closed">Closed / Voided</option>
        </select>
      </label>
      <label>Assignee
        <select value={props.assigneeFilter} onChange={(event) => props.setAssigneeFilter(event.target.value)}>
          <option value="">All</option>
          {props.data.users.map((user) => <option key={user.Email} value={user.Email}>{user.DisplayName}</option>)}
        </select>
      </label>
      <label>Project
        <select value={props.projectFilter} onChange={(event) => props.setProjectFilter(event.target.value)}>
          <option value="">All</option>
          {props.data.projects.map((project) => <option key={project.ProjectId} value={project.ProjectCode}>{project.ProjectCode}</option>)}
        </select>
      </label>
    </div>
  );
}

function TaskTable({ data, tasks, user, setModal, compact = false }: { data: AppData; tasks: Task[]; user: User; setModal?: (modal: ModalState) => void; compact?: boolean }) {
  return (
    <div className="table">
      <div className={compact ? 'tr th compact-task-grid' : 'tr th task-grid'}>
        <span>Task</span><span>Project</span><span>People</span><span>Status</span><span>Due</span>{!compact && <span>Actions</span>}
      </div>
      {tasks.map((task) => (
        <div className={compact ? 'tr compact-task-grid' : 'tr task-grid'} key={task.TaskId}>
          <span><strong>{task.TaskCode}</strong><small>{task.TaskType} / {task.TaskName}</small></span>
          <span>{task.ProjectCode}<small>{projectName(data, task.ProjectId)}</small></span>
          <span>By: {displayUser(data, task.AssignedByEmail)}<small>To: {displayUser(data, task.AssigneeEmail)}</small></span>
          <span><Status status={task.TaskStatus} /><small>{task.TaskResult}{task.ResultReason ? ` / ${task.ResultReason}` : ''}</small></span>
          <span>{task.DueDate || '-'}{isOverdue(task) && <small className="danger-text">Overdue</small>}</span>
          {!compact && <span className="row-actions">{setModal && actionButtons(task, user, setModal)}</span>}
        </div>
      ))}
      {tasks.length === 0 && <div className="empty">No matching tasks.</div>}
    </div>
  );
}

function TaskCards({ data, tasks, user, mode, setModal, applyData, token }: { data: AppData; tasks: Task[]; user: User; mode: 'assignee' | 'review'; setModal: (modal: ModalState) => void; applyData: (data: AppData) => void; token: string }) {
  if (tasks.length === 0) return <div className="empty-card">No tasks.</div>;
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-card" key={task.TaskId}>
          <div>
            <div className="task-title-line"><strong>{task.TaskName}</strong><Status status={task.TaskStatus} /></div>
            <span>{task.TaskCode} / {task.ProjectCode} / {task.TaskType}</span>
            <div className="task-fields">
              <span>By: {displayUser(data, task.AssignedByEmail)}</span>
              <span>To: {displayUser(data, task.AssigneeEmail)}</span>
              <span>Due: {task.DueDate || '-'}</span>
              <span>Result: {task.TaskResult}{task.ResultReason ? ` / ${task.ResultReason}` : ''}</span>
            </div>
          </div>
          <div className="actions">
            {mode === 'assignee' && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus) && (
              <>
                <button className="ok" onClick={() => setModal({ type: 'result', task, action: 'complete' })}>Submit Done</button>
                <button className="warn" onClick={() => setModal({ type: 'result', task, action: 'rejected' })}>Report Rejected</button>
                <button className="bad" onClick={() => setModal({ type: 'result', task, action: 'blocked' })}>Report Blocked</button>
              </>
            )}
            {mode === 'review' && task.TaskStatus === STATUS_PENDING && (
              <>
                {task.TaskResult === RESULT_DONE && <button className="ok" onClick={async () => applyData(await api.reviewTask(token, { TaskId: task.TaskId, Action: 'approve', Comment: 'Approved by PM' }))}>Approve</button>}
                <button className="warn" onClick={() => setModal({ type: 'review', task, action: 'return' })}>Return</button>
                {task.TaskResult !== RESULT_DONE && <button className="bad" onClick={() => setModal({ type: 'review', task, action: 'close' })}>Close</button>}
                {task.TaskResult !== RESULT_DONE && <button className="branch" onClick={() => setModal({ type: 'followUp', task })}>Follow-up</button>}
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function HelpCards({ mode }: { mode: 'assignee' | 'review' }) {
  const cards = mode === 'assignee'
    ? [
        ['Submit Done', 'The task goal has been reached and will be sent to PM review.'],
        ['Report Rejected', 'The work has a result, but customer/supplier/internal review did not accept it.'],
        ['Report Blocked', 'The task cannot proceed because required conditions or information are missing.']
      ]
    : [
        ['Approve', 'PM confirms the result and marks the task completed.'],
        ['Return', 'PM asks the assignee to add information or redo the task.'],
        ['Follow-up', 'Create the next task while closing the current one.']
      ];
  return <div className="help-grid">{cards.map((card) => <div className="help-card" key={card[0]}><strong>{card[0]}</strong><span>{card[1]}</span></div>)}</div>;
}

function Projects({ data, setModal }: { data: AppData; setModal: (modal: ModalState) => void }) {
  return (
    <section className="content">
      <div className="section-heading"><h2>Projects</h2><button className="primary" onClick={() => setModal({ type: 'project' })}><Plus size={16} />New Project</button></div>
      <div className="project-grid">
        {data.projects.map((project) => (
          <article className="project-card" key={project.ProjectId}>
            <strong>{project.ProjectCode}</strong>
            <span>{project.ProjectName}</span>
            <small>{project.ItemCodes || 'No items'} / {project.Stage}</small>
            <button className="light" onClick={() => setModal({ type: 'task', project })}>New Task</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Users({ data }: { data: AppData }) {
  return (
    <section className="content">
      <h2>Users</h2>
      <div className="table">
        <div className="tr th user-grid"><span>Account</span><span>Name</span><span>Role</span><span>Email</span></div>
        {data.users.map((user) => <div className="tr user-grid" key={user.Email}><span>{user.Account || '-'}</span><span>{user.DisplayName}</span><span>{user.Role}</span><span>{user.Email}</span></div>)}
      </div>
    </section>
  );
}

function ActionModal({ modal, data, token, close, applyData }: { modal: Exclude<ModalState, null>; data: AppData; token: string; close: () => void; applyData: (data: AppData) => void }) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    let next: AppData;
    if (modal.type === 'project') next = await api.createProject(token, payload);
    else if (modal.type === 'task') next = await api.createTask(token, { ...payload, ProjectId: payload.ProjectId || modal.project?.ProjectId });
    else if (modal.type === 'result') next = await api.submitTaskResult(token, { ...payload, TaskId: modal.task.TaskId, Action: modal.action });
    else if (modal.type === 'review') next = await api.reviewTask(token, { ...payload, TaskId: modal.task.TaskId, Action: modal.action });
    else if (modal.type === 'followUp') next = await api.createFollowUpTask(token, { ...payload, SourceTaskId: modal.task.TaskId });
    else if (modal.type === 'edit') next = await api.editTask(token, { ...payload, TaskId: modal.task.TaskId });
    else next = await api.voidTask(token, { ...payload, TaskId: modal.task.TaskId });
    applyData(next);
    close();
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-head"><h3>{modalTitle(modal)}</h3><button className="light" onClick={close}>Close</button></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          {modal.type === 'project' && <ProjectFields />}
          {modal.type === 'task' && <TaskFields data={data} project={modal.project} />}
          {modal.type === 'edit' && <TaskFields data={data} task={modal.task} />}
          {modal.type === 'followUp' && <TaskFields data={data} sourceTask={modal.task} title={`${modal.task.ResultReason || 'Task issue'}, follow up: ${modal.task.TaskName}`} />}
          {modal.type === 'void' && <label>Void Reason<input name="ResultReason" required /></label>}
          {modal.type === 'result' && modal.action !== 'complete' && <label>Reason<input name="ResultReason" required /></label>}
          {(modal.type === 'result' || modal.type === 'review') && <label>Comment<textarea name="Comment" required /></label>}
          <button className="primary">Submit</button>
        </form>
      </section>
    </div>
  );
}

function ProjectFields() {
  const stages = [
    ['\u8a55\u4f30\u4e2d', 'Evaluation'],
    ['\u4f30\u50f9\u4e2d', 'Quoting'],
    ['\u6253\u6a23\u4e2d', 'Sampling'],
    ['\u5ba2\u6236\u627f\u8a8d\u4e2d', 'Customer approval'],
    ['\u91cf\u7522\u4e2d', 'Mass production'],
    ['\u8a02\u55ae\u7d50\u6848', 'Order closed']
  ];
  return (
    <>
      <label>Project Code<input name="ProjectCode" placeholder="Auto if blank" /></label>
      <label>Project Name<input name="ProjectName" required /></label>
      <label>Item Codes<input name="ItemCodes" placeholder="Separate with /" /></label>
      <label>Stage<select name="Stage">{stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </>
  );
}

function TaskFields({ data, project, task, sourceTask, title }: { data: AppData; project?: Project; task?: Task; sourceTask?: Task; title?: string }) {
  return (
    <>
      {!project && !task && !sourceTask && <label>Project<select name="ProjectId" defaultValue={task?.ProjectId || sourceTask?.ProjectId}>{data.projects.map((item) => <option key={item.ProjectId} value={item.ProjectId}>{item.ProjectCode} / {item.ProjectName}</option>)}</select></label>}
      <label>Task Type<select name="TaskType" defaultValue={task?.TaskType || TASK_TYPE_SUPPLIER_QUOTE}>{data.taskTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Assignee<select name="AssigneeEmail" defaultValue={task?.AssigneeEmail}>{data.users.map((item) => <option key={item.Email} value={item.Email}>{item.DisplayName} / {item.Role}</option>)}</select></label>
      <label>Task Name<input name="TaskName" defaultValue={task?.TaskName || title || ''} required /></label>
      <label>Description<textarea name="Description" defaultValue={task?.Description || (sourceTask ? `Source task: ${sourceTask.TaskCode} / ${sourceTask.TaskName}` : '')} /></label>
      <label>Due Date<input type="date" name="DueDate" defaultValue={task?.DueDate || ''} required /></label>
      <label>Standard Hours<input type="number" name="StandardHours" step="0.5" defaultValue={task?.StandardHours || 2} /></label>
    </>
  );
}

function actionButtons(task: Task, user: User, setModal: (modal: ModalState) => void) {
  const editable = canReview(user, task) && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus);
  return (
    <>
      {editable && <button className="light" onClick={() => setModal({ type: 'edit', task })}>Edit</button>}
      {editable && <button className="bad" onClick={() => setModal({ type: 'void', task })}>Void</button>}
    </>
  );
}

function Metric({ label, value, tone = '' }: { label: string; value: number; tone?: string }) {
  return <article className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong></article>;
}

function Status({ status }: { status: string }) {
  return <em className={`status ${status === STATUS_COMPLETED ? 'done' : status === STATUS_PENDING ? 'review' : status === STATUS_RETURNED ? 'returned' : status === STATUS_CLOSED ? 'closed' : ''}`}>{status}</em>;
}

function modalTitle(modal: Exclude<ModalState, null>) {
  if (modal.type === 'project') return 'New Project';
  if (modal.type === 'task') return 'New Task';
  if (modal.type === 'edit') return 'Edit Task';
  if (modal.type === 'void') return 'Void Task';
  if (modal.type === 'followUp') return 'Create Follow-up Task';
  if (modal.type === 'result') return modal.action === 'complete' ? 'Submit Done' : modal.action === 'rejected' ? 'Report Rejected' : 'Report Blocked';
  return modal.action === 'return' ? 'Return Task' : 'Close Task';
}

function filterTasks(tasks: Task[], filters: { keyword: string; statusFilter: string; assigneeFilter: string; projectFilter: string }, data: AppData) {
  const keyword = filters.keyword.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.statusFilter === 'unfinished' && !unfinishedStatuses.includes(task.TaskStatus)) return false;
    if (filters.statusFilter === 'closed' && ![STATUS_CLOSED, STATUS_VOIDED].includes(task.TaskStatus)) return false;
    if (!['all', 'unfinished', 'closed'].includes(filters.statusFilter) && task.TaskStatus !== filters.statusFilter) return false;
    if (filters.assigneeFilter && !sameEmail(task.AssigneeEmail, filters.assigneeFilter)) return false;
    if (filters.projectFilter && task.ProjectCode !== filters.projectFilter) return false;
    if (!keyword) return true;
    return [task.TaskCode, task.TaskName, task.TaskType, task.ProjectCode, projectName(data, task.ProjectId), task.AssigneeEmail, task.AssignedByEmail].some((value) => String(value || '').toLowerCase().includes(keyword));
  });
}

function getNotifications(data: AppData, user: User) {
  return data.tasks.filter((task) =>
    (sameEmail(task.AssigneeEmail, user.Email) && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus)) ||
    (task.TaskStatus === STATUS_PENDING && canReview(user, task)) ||
    (sameEmail(task.AssigneeEmail, user.Email) && isOverdue(task))
  );
}

function canReview(user: User, task: Task) {
  return user.Role === 'Admin' || user.Role === 'PM' || sameEmail(user.Email, task.AssignedByEmail);
}

function isOverdue(task: Task) {
  if (!task.DueDate || !unfinishedStatuses.includes(task.TaskStatus)) return false;
  const due = new Date(task.DueDate.replace(/\//g, '-'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function projectName(data: AppData, projectId: string) {
  return data.projects.find((project) => String(project.ProjectId) === String(projectId))?.ProjectName || '';
}

function displayUser(data: AppData, email: string) {
  const user = data.users.find((item) => sameEmail(item.Email, email));
  return user ? user.DisplayName : email;
}

function sameEmail(a: string, b: string) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
