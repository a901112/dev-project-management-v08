import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, ClipboardList, Eye, FolderKanban, LogOut, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { api } from './api';
import type { AppData, Project, Task, User } from './types';

type View = 'dashboard' | 'projects' | 'projectDetail' | 'allTasks' | 'myTasks' | 'review' | 'users';
type ModalState =
  | { type: 'task'; project?: Project }
  | { type: 'project' }
  | { type: 'result'; task: Task; action: 'complete' | 'rejected' | 'blocked' }
  | { type: 'review'; task: Task; action: 'return' | 'close' }
  | { type: 'followUp'; task: Task }
  | { type: 'edit'; task: Task }
  | { type: 'void'; task: Task }
  | null;

type ProjectHealth = {
  label: string;
  title: string;
  description: string;
  tone: 'gray' | 'danger' | 'warn' | 'notice' | 'info' | 'ok' | 'idle';
};

type ProjectFiltersState = {
  keyword: string;
  status: string;
  stage: string;
  health: string;
  owner: string;
};

const STATUS_IN_PROGRESS = '進行中';
const STATUS_RETURNED = '已退回';
const STATUS_PENDING = '待覆判';
const STATUS_COMPLETED = '已完成';
const STATUS_CLOSED = '已結案';
const STATUS_VOIDED = '作廢';
const STAGE_ORDER_CLOSED = '訂單結案';
const RESULT_DONE = '完成';
const TASK_TYPE_SUPPLIER_QUOTE = '供應商估價';

const tokenKey = 'pm-v08-token';
const userKey = 'pm-v08-user';
const unfinishedStatuses = [STATUS_IN_PROGRESS, STATUS_RETURNED, STATUS_PENDING];
const projectStatuses = [STATUS_IN_PROGRESS, '指定結案', STATUS_CLOSED, STATUS_VOIDED];
const projectStages = ['評估中', '估價中', '打樣中', '客戶承認中', '量產中', STAGE_ORDER_CLOSED];

const navItems: Array<{ view: View; label: string; icon: typeof FolderKanban }> = [
  { view: 'dashboard', label: '儀表板', icon: Bell },
  { view: 'projects', label: '專案管理', icon: FolderKanban },
  { view: 'allTasks', label: '任務清單', icon: ClipboardList },
  { view: 'myTasks', label: '我的任務', icon: CheckCircle2 },
  { view: 'review', label: '待覆判', icon: ShieldCheck },
  { view: 'users', label: '人員設定', icon: ShieldCheck }
];

const emptyProjectFilters: ProjectFiltersState = { keyword: '', status: '', stage: '', health: '', owner: '' };

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '');
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(userKey);
    return stored ? JSON.parse(stored) : null;
  });
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState('');
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

  function openProject(project: Project) {
    setSelectedProjectId(project.ProjectId);
    setView('projectDetail');
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
  const selectedProject = data.projects.find((project) => String(project.ProjectId) === String(selectedProjectId)) || data.projects[0];

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
      {view === 'projects' && <Projects data={data} setModal={setModal} openProject={openProject} />}
      {view === 'projectDetail' && selectedProject && <ProjectDetail data={data} project={selectedProject} setModal={setModal} back={() => setView('projects')} />}
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
            const active = view === item.view || (view === 'projectDetail' && item.view === 'projects');
            return (
              <button key={item.view} className={active ? 'active' : ''} onClick={() => setView(item.view)}>
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
    <div className="filter-panel task-filter-panel">
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

function Projects({ data, setModal, openProject }: { data: AppData; setModal: (modal: ModalState) => void; openProject: (project: Project) => void }) {
  const [filters, setFilters] = useState<ProjectFiltersState>(emptyProjectFilters);
  const rows = useMemo(() => data.projects.map((project) => {
    const tasks = projectTasks(data, project);
    const health = projectHealth(project, tasks);
    const plannedCloseDate = getProjectPlannedCloseDate(project, tasks);
    const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
    const overdueTasks = openTasks.filter((task) => isOverdue(task));
    return { project, tasks, health, plannedCloseDate, openTasks, overdueTasks };
  }), [data]);
  const filteredRows = rows.filter((row) => matchProjectFilters(row, filters, data));
  const activeCount = rows.filter((row) => !isProjectClosed(row.project)).length;
  const riskCount = rows.filter((row) => ['danger', 'warn'].includes(row.health.tone)).length;
  const idleCount = rows.filter((row) => row.health.tone === 'idle').length;
  const okCount = rows.filter((row) => row.health.tone === 'ok').length;

  return (
    <section className="content">
      <div className="section-heading">
        <h2>專案管理</h2>
        <button className="primary" onClick={() => setModal({ type: 'project' })}><Plus size={16} />新增專案</button>
      </div>
      <div className="project-summary-grid">
        <Metric label="進行中專案" value={activeCount} />
        <Metric label="需注意專案" value={riskCount} tone={riskCount ? 'bad' : ''} />
        <Metric label="閒置專案" value={idleCount} tone={idleCount ? 'warn' : ''} />
        <Metric label="狀態正常" value={okCount} tone="ok" />
      </div>
      <ProjectFilters data={data} rows={rows} filters={filters} setFilters={setFilters} />
      <div className="project-panel table">
        <div className="tr th project-list-grid">
          <span>專案代碼</span><span>專案名稱 / 專案品項</span><span>新增日期</span><span>負責人</span><span>進度</span><span>專案健康度</span><span>任務</span><span>訂單層</span><span>操作</span>
        </div>
        {filteredRows.map(({ project, tasks, health, plannedCloseDate, openTasks, overdueTasks }) => (
          <div className="tr project-list-grid" key={project.ProjectId}>
            <span><button className="link-button" onClick={() => openProject(project)}>{project.ProjectCode}</button><small>{project.Status || '-'}</small></span>
            <span>
              <button className="project-name-button" onClick={() => openProject(project)}>{project.ProjectName}</button>
              <small>{renderItemChips(project.ItemCodes)}</small>
            </span>
            <span>{formatDateOnly(project.CreatedAt) || '-'}</span>
            <span>{displayUser(data, project.OwnerEmail)}</span>
            <span><Status status={project.Stage || '-'} /><small>預計結案：{plannedCloseDate || '-'}</small></span>
            <span>
              <span className="health-title"><em className={`health-badge ${health.tone}`}>{health.label}</em><strong>{health.title}</strong></span>
              <small className="health-copy">{health.description}</small>
            </span>
            <span>共 {tasks.length} 件<small>未完成 {openTasks.length} 件{overdueTasks.length ? ` / 逾期 ${overdueTasks.length} 件` : ''}</small></span>
            <span className="order-placeholder">待串接 ERP<small>訂單 / 客戶 / 出貨狀態</small></span>
            <span className="row-actions"><button className="light" onClick={() => openProject(project)}><Eye size={15} />內頁</button><button className="light" onClick={() => setModal({ type: 'task', project })}>新增任務</button></span>
          </div>
        ))}
        {filteredRows.length === 0 && <div className="empty">沒有符合條件的專案。</div>}
      </div>
    </section>
  );
}

function ProjectFilters({ data, rows, filters, setFilters }: { data: AppData; rows: Array<{ project: Project; health: ProjectHealth }>; filters: ProjectFiltersState; setFilters: (filters: ProjectFiltersState) => void }) {
  const healthOptions = Array.from(new Map(rows.map((row) => [row.health.label, row.health])).values());
  function update(key: keyof ProjectFiltersState, value: string) {
    setFilters({ ...filters, [key]: value });
  }
  return (
    <div className="filter-panel project-filter-panel">
      <label><Search size={14} />關鍵字<input value={filters.keyword} onChange={(event) => update('keyword', event.target.value)} placeholder="專案名稱 / 代碼 / 品號 / 負責人" /></label>
      <label>專案狀態<select value={filters.status} onChange={(event) => update('status', event.target.value)}><option value="">全部</option>{projectStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label>主階段<select value={filters.stage} onChange={(event) => update('stage', event.target.value)}><option value="">全部</option>{projectStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
      <label>健康度<select value={filters.health} onChange={(event) => update('health', event.target.value)}><option value="">全部</option>{healthOptions.map((health) => <option key={health.label} value={health.label}>{health.label}</option>)}</select></label>
      <label>負責人<select value={filters.owner} onChange={(event) => update('owner', event.target.value)}><option value="">全部</option>{data.users.map((user) => <option key={user.Email} value={user.Email}>{user.DisplayName}</option>)}</select></label>
      <button className="light filter-reset" onClick={() => setFilters(emptyProjectFilters)}>清除篩選</button>
    </div>
  );
}

function ProjectDetail({ data, project, setModal, back }: { data: AppData; project: Project; setModal: (modal: ModalState) => void; back: () => void }) {
  const tasks = projectTasks(data, project);
  const health = projectHealth(project, tasks);
  const plannedCloseDate = getProjectPlannedCloseDate(project, tasks);
  const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
  const overdueTasks = openTasks.filter((task) => isOverdue(task));
  const items = splitItemCodes(project.ItemCodes);

  return (
    <section className="content project-detail-page">
      <div className="section-heading">
        <div>
          <button className="text-back" onClick={back}>← 回專案清單</button>
          <h2>{project.ProjectCode} / {project.ProjectName}</h2>
        </div>
        <div className="actions">
          <button className="light" onClick={() => setModal({ type: 'task', project })}><Plus size={16} />新增任務</button>
          <button className="bad">結案 / 強制結案</button>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-panel project-main-panel">
          <div className="detail-title-row"><h3>專案主檔</h3><em className={`health-badge ${health.tone}`}>{health.label}</em></div>
          <div className="field-grid">
            <Info label="專案主階段" value={<Status status={project.Stage || '-'} />} />
            <Info label="專案狀態" value={project.Status || '-'} />
            <Info label="專案負責人" value={displayUser(data, project.OwnerEmail)} />
            <Info label="新增日期" value={formatDateOnly(project.CreatedAt) || '-'} />
            <Info label="預計結案日" value={plannedCloseDate || '-'} />
            <Info label="關聯客戶" value="目前由 ERP 訂單層帶出" />
          </div>
          <div className="note-box">專案主階段是內部摘要，不代表每一個品號或每一個客戶都已經走到同一進度。細部差異放在下方品號 / 客戶 / 訂單層。</div>
        </section>

        <section className="detail-panel">
          <h3>專案摘要判斷</h3>
          <div className="status-box">
            <strong>{health.title}</strong>
            <span>{health.description}</span>
          </div>
          <div className="field-grid compact">
            <Info label="全部任務" value={`${tasks.length} 件`} />
            <Info label="未完成任務" value={`${openTasks.length} 件`} />
            <Info label="逾期任務" value={`${overdueTasks.length} 件`} />
            <Info label="專案品項" value={`${items.length} 個`} />
          </div>
        </section>
      </div>

      <section className="detail-panel full-width">
        <h3>專案主階段</h3>
        <div className="stage-track">{projectStages.map((stage) => <span key={stage} className={project.Stage === stage ? 'active' : ''}>{stage.replace('中', '')}</span>)}</div>
      </section>

      <section className="detail-panel full-width">
        <div className="section-heading in-panel"><h3>專案品項</h3><span className="muted">品號是專案和 ERP 的橋，未來由這裡串訂單、客戶、預交日與交貨狀態。</span></div>
        <div className="item-row">{renderItemChips(project.ItemCodes)}</div>
      </section>

      <section className="detail-panel full-width">
        <h3>細項進度：品號 / 客戶 / 訂單層</h3>
        <div className="table detail-table">
          <div className="tr th order-grid"><span>品號</span><span>客戶</span><span>訂單</span><span>訂單數量</span><span>已交數量</span><span>預交日</span><span>細項狀態</span><span>目前說明</span></div>
          {(items.length ? items : ['尚未加入品號']).map((item) => (
            <div className="tr order-grid" key={item}><span>{item}</span><span>待串接</span><span>待串接 ERP</span><span>-</span><span>-</span><span>-</span><span><Status status="待查詢" /></span><span>V0.8 先保留訂單層位置，後續接 COPTC / COPTD 後自動帶出。</span></div>
          ))}
        </div>
      </section>

      <section className="detail-panel full-width">
        <div className="section-heading in-panel"><h3>任務清單</h3><button className="light" onClick={() => setModal({ type: 'task', project })}>新增任務</button></div>
        <TaskTable data={data} tasks={tasks} user={data.currentUser} setModal={setModal} />
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return <div className="info-cell"><span>{label}</span><strong>{value}</strong></div>;
}

function renderItemChips(itemCodes: string) {
  const items = splitItemCodes(itemCodes);
  if (items.length === 0) return <em className="item-chip empty">尚未加入品號</em>;
  return items.map((item) => <em className="item-chip" key={item}>{item}</em>);
}

function splitItemCodes(value: string) {
  return String(value || '').split(/[\/、,，\s]+/).map((item) => item.trim()).filter(Boolean);
}

function matchProjectFilters(row: { project: Project; health: ProjectHealth }, filters: ProjectFiltersState, data: AppData) {
  const keyword = filters.keyword.trim().toLowerCase();
  if (filters.status && row.project.Status !== filters.status) return false;
  if (filters.stage && row.project.Stage !== filters.stage) return false;
  if (filters.health && row.health.label !== filters.health) return false;
  if (filters.owner && !sameEmail(row.project.OwnerEmail, filters.owner)) return false;
  if (!keyword) return true;
  const ownerName = displayUser(data, row.project.OwnerEmail);
  return [row.project.ProjectCode, row.project.ProjectName, row.project.ItemCodes, row.project.Status, row.project.Stage, ownerName, row.health.label, row.health.title]
    .some((value) => String(value || '').toLowerCase().includes(keyword));
}

function projectTasks(data: AppData, project: Project) {
  return data.tasks.filter((task) => String(task.ProjectId) === String(project.ProjectId) || task.ProjectCode === project.ProjectCode);
}

function projectHealth(project: Project, tasks: Task[]): ProjectHealth {
  const itemCount = splitItemCodes(project.ItemCodes).length;
  const plannedCloseDate = getProjectPlannedCloseDate(project, tasks);
  const daysToClose = plannedCloseDate ? daysFromToday(plannedCloseDate) : null;
  const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
  const overdueTasks = openTasks.filter((task) => isOverdue(task));
  const allTasksFinished = tasks.length > 0 && tasks.every((task) => [STATUS_COMPLETED, STATUS_CLOSED, STATUS_VOIDED].includes(task.TaskStatus));

  if (isProjectClosed(project)) return { label: '已結案', title: '專案已結案', description: '此專案已結案，建議確認任務與 ERP 訂單資料是否完整。', tone: 'gray' };
  if (daysToClose !== null && daysToClose < 0) return { label: '逾期', title: `逾期 ${Math.abs(daysToClose)} 天`, description: '此專案已超過預計結案日，請確認是否調整時程或催辦任務。', tone: 'danger' };
  if (overdueTasks.length > 0) return { label: '注意', title: `逾期任務 ${overdueTasks.length} 件`, description: '目前已有任務超過預計結案日，請優先確認承辦進度。', tone: 'danger' };
  if (daysToClose !== null && daysToClose <= 14) return { label: '即將到期', title: `即將到期 ${daysToClose} 天`, description: '距離預計結案日較近，建議確認剩餘任務是否能如期完成。', tone: 'warn' };
  if (itemCount === 0) return { label: '待補資料', title: '尚未加入品號', description: '尚未加入專案品號，ERP 訂單資訊無法帶出。', tone: 'notice' };
  if (tasks.length === 0) return { label: '待建立', title: '尚未建立任務', description: '此專案尚未建立開發流程任務，建議先建立任務清單。', tone: 'notice' };
  if (allTasksFinished) return { label: '閒置', title: '閒置專案', description: '此專案曾建立任務且任務皆已完成，但專案尚未結案，請確認是否需要結案或建立後續任務。', tone: 'idle' };
  if (openTasks.length > 0) return { label: '進行中', title: '仍有任務未完成', description: `目前尚有 ${openTasks.length} 件任務未完成，請持續追蹤承辦進度。`, tone: 'info' };
  return { label: '正常', title: '目前狀態正常', description: '目前專案資料完整，任務與時程狀態正常。', tone: 'ok' };
}

function isProjectClosed(project: Project) {
  return project.Status === STATUS_CLOSED || project.Status === STATUS_VOIDED || project.Stage === STAGE_ORDER_CLOSED;
}

function getProjectPlannedCloseDate(project: Project, tasks: Task[]) {
  const fields = project as unknown as Record<string, string>;
  const explicit = fields.PlannedCloseDate || fields.ExpectedCloseDate || fields.EstimatedCloseDate || fields.TargetCloseDate || fields.DueDate || fields['預計結案日'];
  if (explicit) return formatDateOnly(explicit);
  const taskDueDates = tasks.map((task) => formatDateOnly(task.DueDate)).filter(Boolean).sort();
  return taskDueDates.at(-1) || '';
}

function daysFromToday(dateText: string) {
  const date = parseDateOnly(dateText);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

function parseDateOnly(value: string) {
  const normalized = String(value || '').trim().replace(/\//g, '-').slice(0, 10);
  if (!normalized) return null;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateOnly(value: string) {
  const date = parseDateOnly(value);
  return date ? date.toISOString().slice(0, 10) : '';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
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
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-head"><h3>{modalTitle(modal)}</h3><button className="light" onClick={close}>關閉</button></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          {modal.type === 'project' && <ProjectFields data={data} />}
          {modal.type === 'task' && <TaskFields data={data} project={modal.project} />}
          {modal.type === 'edit' && <TaskFields data={data} task={modal.task} />}
          {modal.type === 'followUp' && <TaskFields data={data} sourceTask={modal.task} title={`${modal.task.ResultReason || '任務異常'}，後續處理：${modal.task.TaskName}`} />}
          {modal.type === 'void' && <label>作廢原因<input name="ResultReason" required /></label>}
          {modal.type === 'result' && modal.action !== 'complete' && <label>原因<input name="ResultReason" required /></label>}
          {(modal.type === 'result' || modal.type === 'review') && <label>備註<textarea name="Comment" required /></label>}
          {error && <div className="error">{error}</div>}
          <button className="primary" disabled={isSubmitting}>{isSubmitting ? '送出中...' : '送出'}</button>
        </form>
      </section>
    </div>
  );
}

function ProjectFields({ data }: { data: AppData }) {
  return (
    <div className="project-form-grid">
      <label>專案代碼<input name="ProjectCode" placeholder="空白時系統自動產生" /></label>
      <label>專案名稱<input name="ProjectName" required /></label>
      <label>專案品項<input name="ItemCodes" placeholder="多個品號請用 / 分隔，例如 25000/25006" /></label>
      <label>專案負責人<select name="OwnerEmail" defaultValue={data.currentUser.Email}>{data.users.map((user) => <option key={user.Email} value={user.Email}>{user.DisplayName} / {user.Role}</option>)}</select></label>
      <label>進度<select name="Stage">{projectStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
      <label>狀態<select name="Status">{projectStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label>新增專案日期<input type="date" name="CreatedDate" /></label>
      <label>預計結案日<input type="date" name="PlannedCloseDate" /></label>
      <label>策略 / 專案類型<select name="ProjectStrategy"><option>標準開發</option><option>湊量開發</option><option>替代料開發</option><option>客戶指定開發</option><option>內部評估</option></select></label>
      <label>優先度<select name="Priority"><option>一般</option><option>高</option><option>低</option></select></label>
      <label className="wide-field">專案說明<textarea name="Description" placeholder="開案原因、客戶需求、注意事項" /></label>
      <label className="wide-field">備註<textarea name="Remark" placeholder="暫存補充資訊，之後可再整理欄位" /></label>
    </div>
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
  return user ? user.DisplayName : email || '-';
}

function sameEmail(a: string, b: string) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
