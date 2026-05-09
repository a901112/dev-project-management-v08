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
  { view: 'dashboard', label: '儀表板', icon: Bell },
  { view: 'allTasks', label: '任務清單', icon: ClipboardList },
  { view: 'myTasks', label: '我的任務', icon: CheckCircle2 },
  { view: 'review', label: '待覆判', icon: ShieldCheck },
  { view: 'projects', label: '專案管理', icon: FolderKanban },
  { view: 'users', label: '人員設定', icon: ShieldCheck }
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
    return <Shell user={user} view={view} setView={setView} logout={logout}><section className="content">載入中...</section></Shell>;
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
        <button className="light" onClick={refresh}><RefreshCw size={16} />重新整理</button>
      </header>
      {error && <div className="content"><div className="error">{error}</div></div>}
      {view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} setView={setView} />}
      {view === 'allTasks' && (
        <section className="content">
          <div className="section-heading">
            <h2>任務清單</h2>
            <button className="primary" onClick={() => setModal({ type: 'task' })}><Plus size={16} />新增任務</button>
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
          <h2>我的任務</h2>
          <HelpCards mode="assignee" />
          <TaskCards data={data} tasks={myTasks} user={user} mode="assignee" setModal={setModal} applyData={setData} token={token} />
        </section>
      )}
      {view === 'review' && (
        <section className="content">
          <h2>待覆判任務</h2>
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
            <h1>開發專案管理</h1>
            <p>V0.8 試用版</p>
          </div>
        </div>
        <label>帳號<input value={account} onChange={(event) => setAccount(event.target.value)} autoFocus /></label>
        <label>密碼<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary">登入</button>
        <p className="muted">測試帳號維護於 Google Sheet 的 Users 分頁。</p>
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
          <div><strong>專案任務系統</strong><span>V0.8</span></div>
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
        <button className="logout" onClick={logout}><LogOut size={18} />登出</button>
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
      <h2>儀表板</h2>
      <div className="metric-grid">
        <Metric label="我的未完成任務" value={myOpen.length} />
        <Metric label="待覆判任務" value={pendingReview.length} />
        <Metric label="逾期任務" value={overdue.length} tone={overdue.length ? 'bad' : ''} />
        <Metric label="登入提醒" value={notifications.length} tone={notifications.length ? 'warn' : ''} />
      </div>
      <div className="section-heading">
        <h3><Bell size={18} />登入提醒</h3>
        <button className="light" onClick={() => setView('allTasks')}>開啟任務清單</button>
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
      <label><Search size={14} />關鍵字<input value={props.keyword} onChange={(event) => props.setKeyword(event.target.value)} placeholder="任務、專案、人員" /></label>
      <label>狀態
        <select value={props.statusFilter} onChange={(event) => props.setStatusFilter(event.target.value)}>
          <option value="unfinished">未完成</option>
          <option value="all">全部</option>
          <option value={STATUS_IN_PROGRESS}>進行中</option>
          <option value={STATUS_PENDING}>待覆判</option>
          <option value={STATUS_RETURNED}>已退回</option>
          <option value={STATUS_COMPLETED}>已完成</option>
          <option value="closed">已結案 / 作廢</option>
        </select>
      </label>
      <label>承辦人
        <select value={props.assigneeFilter} onChange={(event) => props.setAssigneeFilter(event.target.value)}>
          <option value="">全部</option>
          {props.data.users.map((user) => <option key={user.Email} value={user.Email}>{user.DisplayName}</option>)}
        </select>
      </label>
      <label>專案
        <select value={props.projectFilter} onChange={(event) => props.setProjectFilter(event.target.value)}>
          <option value="">全部</option>
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
        <span>任務</span><span>專案</span><span>人員</span><span>狀態</span><span>預計結案</span>{!compact && <span>操作</span>}
      </div>
      {tasks.map((task) => (
        <div className={compact ? 'tr compact-task-grid' : 'tr task-grid'} key={task.TaskId}>
          <span><strong>{task.TaskCode}</strong><small>{task.TaskType} / {task.TaskName}</small></span>
          <span>{task.ProjectCode}<small>{projectName(data, task.ProjectId)}</small></span>
          <span>交辦：{displayUser(data, task.AssignedByEmail)}<small>承辦：{displayUser(data, task.AssigneeEmail)}</small></span>
          <span><Status status={task.TaskStatus} /><small>{task.TaskResult}{task.ResultReason ? ` / ${task.ResultReason}` : ''}</small></span>
          <span>{task.DueDate || '-'}{isOverdue(task) && <small className="danger-text">已逾期</small>}</span>
          {!compact && <span className="row-actions">{setModal && actionButtons(task, user, setModal)}</span>}
        </div>
      ))}
      {tasks.length === 0 && <div className="empty">沒有符合條件的任務。</div>}
    </div>
  );
}

function TaskCards({ data, tasks, user, mode, setModal, applyData, token }: { data: AppData; tasks: Task[]; user: User; mode: 'assignee' | 'review'; setModal: (modal: ModalState) => void; applyData: (data: AppData) => void; token: string }) {
  if (tasks.length === 0) return <div className="empty-card">目前沒有任務。</div>;
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-card" key={task.TaskId}>
          <div>
            <div className="task-title-line"><strong>{task.TaskName}</strong><Status status={task.TaskStatus} /></div>
            <span>{task.TaskCode} / {task.ProjectCode} / {task.TaskType}</span>
            <div className="task-fields">
              <span>交辦人：{displayUser(data, task.AssignedByEmail)}</span>
              <span>承辦人：{displayUser(data, task.AssigneeEmail)}</span>
              <span>預計結案日：{task.DueDate || '-'}</span>
              <span>回報結果：{task.TaskResult}{task.ResultReason ? ` / ${task.ResultReason}` : ''}</span>
            </div>
          </div>
          <div className="actions">
            {mode === 'assignee' && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus) && (
              <>
                <button className="ok" onClick={() => setModal({ type: 'result', task, action: 'complete' })}>回報完成</button>
                <button className="warn" onClick={() => setModal({ type: 'result', task, action: 'rejected' })}>回報未通過</button>
                <button className="bad" onClick={() => setModal({ type: 'result', task, action: 'blocked' })}>回報異常</button>
              </>
            )}
            {mode === 'review' && task.TaskStatus === STATUS_PENDING && (
              <>
                {task.TaskResult === RESULT_DONE && <button className="ok" onClick={async () => applyData(await api.reviewTask(token, { TaskId: task.TaskId, Action: 'approve', Comment: 'PM 覆判完成' }))}>覆判完成</button>}
                <button className="warn" onClick={() => setModal({ type: 'review', task, action: 'return' })}>退回補充</button>
                {task.TaskResult !== RESULT_DONE && <button className="bad" onClick={() => setModal({ type: 'review', task, action: 'close' })}>結案</button>}
                {task.TaskResult !== RESULT_DONE && <button className="branch" onClick={() => setModal({ type: 'followUp', task })}>建立後續任務</button>}
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
        ['回報完成', '任務目標已達成，送交交辦人覆判。'],
        ['回報未通過', '已有執行結果，但客戶、供應商或內部評估未接受。'],
        ['回報異常', '任務因資料、條件或外部因素不足，暫時無法繼續。']
      ]
    : [
        ['覆判完成', '交辦人確認結果，任務正式完成。'],
        ['退回補充', '資料不足或需要修正，退回承辦人補充。'],
        ['建立後續任務', '關閉目前任務，同時建立下一個處理任務。']
      ];
  return <div className="help-grid">{cards.map((card) => <div className="help-card" key={card[0]}><strong>{card[0]}</strong><span>{card[1]}</span></div>)}</div>;
}

function Projects({ data, setModal }: { data: AppData; setModal: (modal: ModalState) => void }) {
  return (
    <section className="content">
      <div className="section-heading"><h2>專案管理</h2><button className="primary" onClick={() => setModal({ type: 'project' })}><Plus size={16} />新增專案</button></div>
      <div className="project-grid">
        {data.projects.map((project) => (
          <article className="project-card" key={project.ProjectId}>
            <strong>{project.ProjectCode}</strong>
            <span>{project.ProjectName}</span>
            <small>{project.ItemCodes || '無品項'} / {project.Stage}</small>
            <button className="light" onClick={() => setModal({ type: 'task', project })}>新增任務</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Users({ data }: { data: AppData }) {
  return (
    <section className="content">
      <h2>人員設定</h2>
      <div className="table">
        <div className="tr th user-grid"><span>帳號</span><span>姓名</span><span>角色</span><span>Email</span></div>
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
        <div className="modal-head"><h3>{modalTitle(modal)}</h3><button className="light" onClick={close}>關閉</button></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          {modal.type === 'project' && <ProjectFields />}
          {modal.type === 'task' && <TaskFields data={data} project={modal.project} />}
          {modal.type === 'edit' && <TaskFields data={data} task={modal.task} />}
          {modal.type === 'followUp' && <TaskFields data={data} sourceTask={modal.task} title={`${modal.task.ResultReason || '任務異常'}，後續處理：${modal.task.TaskName}`} />}
          {modal.type === 'void' && <label>作廢原因<input name="ResultReason" required /></label>}
          {modal.type === 'result' && modal.action !== 'complete' && <label>原因<input name="ResultReason" required /></label>}
          {(modal.type === 'result' || modal.type === 'review') && <label>備註<textarea name="Comment" required /></label>}
          <button className="primary">送出</button>
        </form>
      </section>
    </div>
  );
}

function ProjectFields() {
  const stages = [
    ['\u8a55\u4f30\u4e2d', '評估中'],
    ['\u4f30\u50f9\u4e2d', '估價中'],
    ['\u6253\u6a23\u4e2d', '打樣中'],
    ['\u5ba2\u6236\u627f\u8a8d\u4e2d', '客戶承認中'],
    ['\u91cf\u7522\u4e2d', '量產中'],
    ['\u8a02\u55ae\u7d50\u6848', '訂單結案']
  ];
  return (
    <>
      <label>專案代碼<input name="ProjectCode" placeholder="空白時系統自動產生" /></label>
      <label>專案名稱<input name="ProjectName" required /></label>
      <label>品項代碼<input name="ItemCodes" placeholder="多個品項請用 / 分隔" /></label>
      <label>進度<select name="Stage">{stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </>
  );
}

function TaskFields({ data, project, task, sourceTask, title }: { data: AppData; project?: Project; task?: Task; sourceTask?: Task; title?: string }) {
  return (
    <>
      {!project && !task && !sourceTask && <label>專案<select name="ProjectId" defaultValue={task?.ProjectId || sourceTask?.ProjectId}>{data.projects.map((item) => <option key={item.ProjectId} value={item.ProjectId}>{item.ProjectCode} / {item.ProjectName}</option>)}</select></label>}
      <label>任務類型<select name="TaskType" defaultValue={task?.TaskType || TASK_TYPE_SUPPLIER_QUOTE}>{data.taskTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>承辦人<select name="AssigneeEmail" defaultValue={task?.AssigneeEmail}>{data.users.map((item) => <option key={item.Email} value={item.Email}>{item.DisplayName} / {item.Role}</option>)}</select></label>
      <label>任務名稱<input name="TaskName" defaultValue={task?.TaskName || title || ''} required /></label>
      <label>任務說明<textarea name="Description" defaultValue={task?.Description || (sourceTask ? `來源任務：${sourceTask.TaskCode} / ${sourceTask.TaskName}` : '')} /></label>
      <label>預計結案日<input type="date" name="DueDate" defaultValue={task?.DueDate || ''} required /></label>
      <label>標準工時<input type="number" name="StandardHours" step="0.5" defaultValue={task?.StandardHours || 2} /></label>
    </>
  );
}

function actionButtons(task: Task, user: User, setModal: (modal: ModalState) => void) {
  const editable = canReview(user, task) && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus);
  return (
    <>
      {editable && <button className="light" onClick={() => setModal({ type: 'edit', task })}>編輯</button>}
      {editable && <button className="bad" onClick={() => setModal({ type: 'void', task })}>作廢</button>}
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
  if (modal.type === 'project') return '新增專案';
  if (modal.type === 'task') return '新增任務';
  if (modal.type === 'edit') return '編輯任務';
  if (modal.type === 'void') return '作廢任務';
  if (modal.type === 'followUp') return '建立後續任務';
  if (modal.type === 'result') return modal.action === 'complete' ? '回報完成' : modal.action === 'rejected' ? '回報未通過' : '回報異常';
  return modal.action === 'return' ? '退回任務' : '結案任務';
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
