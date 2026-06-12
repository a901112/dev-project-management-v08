import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v44 marker not found: ${label}`);
  return source.replace(from, to);
}

if (!app.includes('type DailyBriefSection')) {
  app = replaceRequired(
    app,
    `type MyTaskFiltersState = {
  keyword: string;
  status: string;
  project: string;
  taskType: string;
};
`,
    `type MyTaskFiltersState = {
  keyword: string;
  status: string;
  project: string;
  taskType: string;
};

type DailyBriefSection = 'progress' | 'followUp' | 'missing' | 'support';

type DailyBriefItem = {
  id: string;
  section: DailyBriefSection;
  title: string;
  body: string;
  meta: string;
  task?: Task;
  tone?: 'warn' | 'bad' | 'ok';
};
`,
    'DailyBrief types'
  );
}

app = replaceOnce(
  app,
  `{view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} unreadNotifications={unreadNotifications} markNotificationsRead={markNotificationsRead} openProject={openProject} setView={setView} />}`,
  `{view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} unreadNotifications={unreadNotifications} markNotificationsRead={markNotificationsRead} openProject={openProject} setView={setView} setModal={setModal} />}`
);

app = replaceOnce(
  app,
  `function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, openProject, setView }: { data: AppData; user: User; notifications: Task[]; unreadNotifications: Task[]; markNotificationsRead: (tasks: Task[]) => void; openProject: (project: Project) => void; setView: (view: View) => void }) {`,
  `function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, openProject, setView, setModal }: { data: AppData; user: User; notifications: Task[]; unreadNotifications: Task[]; markNotificationsRead: (tasks: Task[]) => void; openProject: (project: Project) => void; setView: (view: View) => void; setModal: (modal: ModalState) => void }) {`
);

if (!app.includes('<DailyBrief data={data} user={user} setView={setView} setModal={setModal} />')) {
  app = replaceRequired(
    app,
    `      </div>
      <div className="section-heading">`,
    `      </div>
      <DailyBrief data={data} user={user} setView={setView} setModal={setModal} />
      <div className="section-heading">`,
    'Dashboard DailyBrief render'
  );
}

if (!app.includes('function DailyBrief(')) {
  app = replaceRequired(
    app,
    `function TaskFilters(props: {`,
    `function DailyBrief({ data, user, setView, setModal }: { data: AppData; user: User; setView: (view: View) => void; setModal: (modal: ModalState) => void }) {
  const brief = useMemo(() => buildDailyBrief(data, user), [data, user]);
  const confirmedKey = \`pm-v08-daily-brief:\${user.Email}:\${brief.targetDate}\`;
  const [confirmedIds, setConfirmedIds] = useState<string[]>(() => loadConfirmedBriefItems(confirmedKey));

  useEffect(() => {
    setConfirmedIds(loadConfirmedBriefItems(confirmedKey));
  }, [confirmedKey]);

  function confirmItem(id: string) {
    const next = Array.from(new Set([...confirmedIds, id]));
    setConfirmedIds(next);
    localStorage.setItem(confirmedKey, JSON.stringify(next));
  }

  const confirmedCount = brief.items.filter((item) => confirmedIds.includes(item.id)).length;
  const openCount = Math.max(brief.items.length - confirmedCount, 0);

  return (
    <section className="daily-brief">
      <div className="daily-brief-head">
        <div>
          <h3><ClipboardList size={18} />AI 日報草稿</h3>
          <span>回顧 {brief.targetDate}，今日 {brief.todayDate}</span>
        </div>
        <div className="daily-brief-counters">
          <strong>{brief.items.length}</strong><span>草稿</span>
          <strong>{openCount}</strong><span>待確認</span>
        </div>
      </div>
      <div className="daily-brief-grid">
        <DailyBriefSectionCard
          title="昨日進度"
          empty="昨天沒有可整理的系統進度"
          items={brief.items.filter((item) => item.section === 'progress')}
          confirmedIds={confirmedIds}
          confirmItem={confirmItem}
          setView={setView}
          setModal={setModal}
        />
        <DailyBriefSectionCard
          title="今日應追"
          empty="今天沒有到期追蹤"
          items={brief.items.filter((item) => item.section === 'followUp')}
          confirmedIds={confirmedIds}
          confirmItem={confirmItem}
          setView={setView}
          setModal={setModal}
        />
        <DailyBriefSectionCard
          title="待補歷程"
          empty="昨天沒有明顯缺漏"
          items={brief.items.filter((item) => item.section === 'missing')}
          confirmedIds={confirmedIds}
          confirmItem={confirmItem}
          setView={setView}
          setModal={setModal}
        />
        <DailyBriefSectionCard
          title="支援與樣檢"
          empty="昨天沒有未綁任務紀錄"
          items={brief.items.filter((item) => item.section === 'support')}
          confirmedIds={confirmedIds}
          confirmItem={confirmItem}
          setView={setView}
          setModal={setModal}
        />
      </div>
    </section>
  );
}

function DailyBriefSectionCard({ title, empty, items, confirmedIds, confirmItem, setView, setModal }: {
  title: string;
  empty: string;
  items: DailyBriefItem[];
  confirmedIds: string[];
  confirmItem: (id: string) => void;
  setView: (view: View) => void;
  setModal: (modal: ModalState) => void;
}) {
  return (
    <article className="daily-brief-card">
      <div className="daily-brief-card-head">
        <strong>{title}</strong>
        <span>{items.length}</span>
      </div>
      <div className="daily-brief-list">
        {items.map((item) => {
          const confirmed = confirmedIds.includes(item.id);
          return (
            <div className={\`daily-brief-item \${item.tone || ''} \${confirmed ? 'confirmed' : ''}\`} key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>{item.meta}</small>
              </div>
              <div className="daily-brief-actions">
                <button className={confirmed ? 'ok' : 'light'} onClick={() => confirmItem(item.id)} disabled={confirmed}>
                  <CheckCircle2 size={14} />{confirmed ? '已確認' : '確認'}
                </button>
                {item.task && <button className="light" onClick={() => setModal({ type: 'workLog', task: item.task! })}><MessageSquareText size={14} />補歷程</button>}
                {!item.task && <button className="light" onClick={() => setView('myTasks')}>開啟任務</button>}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="daily-brief-empty">{empty}</div>}
      </div>
    </article>
  );
}

function TaskFilters(props: {`,
    'DailyBrief components'
  );
}

if (!app.includes('function buildDailyBrief(')) {
  app = replaceRequired(
    app,
    `function Metric({ label, value, tone = '' }: { label: string; value: number; tone?: string }) {`,
    `function buildDailyBrief(data: AppData, user: User) {
  const today = startOfLocalDay(new Date());
  const yesterday = addDays(today, -1);
  const taskById = new Map(data.tasks.map((task) => [String(task.TaskId), task]));
  const logs = data.workLogs || [];
  const transitions = data.transitions || [];
  const comments = data.comments || [];
  const items: DailyBriefItem[] = [];

  const addItem = (item: DailyBriefItem) => {
    if (!items.some((existing) => existing.id === item.id)) items.push(item);
  };

  const ownedTask = (task?: Task) => task && sameEmail(task.AssigneeEmail, user.Email);
  const ownedRecord = (recordUserEmail: string, task?: Task) =>
    sameEmail(recordUserEmail, user.Email) || Boolean(task && (sameEmail(task.AssigneeEmail, user.Email) || sameEmail(task.AssignedByEmail, user.Email)));

  logs
    .filter((log) => {
      const task = taskById.get(String(log.TaskId || ''));
      return ownedRecord(log.CreatedByEmail, task) && (sameLocalDate(log.LogDate, yesterday) || sameLocalDate(log.CreatedAt, yesterday));
    })
    .sort((a, b) => String(b.CreatedAt || b.LogDate || '').localeCompare(String(a.CreatedAt || a.LogDate || '')))
    .slice(0, 5)
    .forEach((log) => {
      const task = taskById.get(String(log.TaskId || ''));
      addItem({
        id: \`log:\${log.WorkLogId || log.TaskId}:\${log.CreatedAt || log.LogDate}\`,
        section: task ? 'progress' : 'support',
        title: task ? dailyTaskTitle(data, task) : log.ContactTarget || '未綁任務工作',
        body: compactText(log.Content || '已新增工作歷程', 120),
        meta: [log.LogType || '工作歷程', log.ContactTarget, displayBriefDate(log.CreatedAt || log.LogDate)].filter(Boolean).join(' / '),
        task,
        tone: 'ok'
      });
    });

  transitions
    .filter((item) => {
      const task = taskById.get(String(item.TaskId || ''));
      return ownedRecord(String(item.UserEmail || ''), task) && sameLocalDate(String(item.CreatedAt || ''), yesterday);
    })
    .sort((a, b) => String(b.CreatedAt || '').localeCompare(String(a.CreatedAt || '')))
    .slice(0, 6)
    .forEach((transition) => {
      const task = taskById.get(String(transition.TaskId || ''));
      addItem({
        id: \`transition:\${transition.TransitionId || transition.TaskId}:\${transition.CreatedAt}\`,
        section: task ? 'progress' : 'support',
        title: task ? dailyTaskTitle(data, task) : '未綁任務異動',
        body: compactText(String(transition.Note || taskActionLabel(String(transition.Action || '')) || '任務狀態已更新'), 120),
        meta: [taskActionLabel(String(transition.Action || '')), displayBriefDate(String(transition.CreatedAt || ''))].filter(Boolean).join(' / '),
        task,
        tone: transition.Action === 'return' || transition.ToStatus === STATUS_RETURNED ? 'warn' : 'ok'
      });
    });

  comments
    .filter((comment) => {
      const task = taskById.get(String(comment.TaskId || ''));
      return ownedRecord(String(comment.UserEmail || ''), task) && sameLocalDate(String(comment.CreatedAt || ''), yesterday);
    })
    .sort((a, b) => String(b.CreatedAt || '').localeCompare(String(a.CreatedAt || '')))
    .slice(0, 4)
    .forEach((comment) => {
      const task = taskById.get(String(comment.TaskId || ''));
      addItem({
        id: \`comment:\${comment.CommentId || comment.TaskId}:\${comment.CreatedAt}\`,
        section: task ? 'progress' : 'support',
        title: task ? dailyTaskTitle(data, task) : '未綁任務留言',
        body: compactText(String(comment.Body || comment.Action || '已新增補充說明'), 120),
        meta: [String(comment.Action || '補充說明'), displayBriefDate(String(comment.CreatedAt || ''))].filter(Boolean).join(' / '),
        task
      });
    });

  const followUpTaskIds = new Set<string>();
  logs
    .filter((log) => {
      const task = taskById.get(String(log.TaskId || ''));
      return Boolean(task && ownedRecord(log.CreatedByEmail, task) && unfinishedStatuses.includes(task.TaskStatus) && onOrBeforeLocalDate(log.NextFollowUpDate, today));
    })
    .sort((a, b) => String(a.NextFollowUpDate || '').localeCompare(String(b.NextFollowUpDate || '')))
    .slice(0, 6)
    .forEach((log) => {
      const task = taskById.get(String(log.TaskId || ''));
      if (!task) return;
      followUpTaskIds.add(String(task.TaskId));
      addItem({
        id: \`follow-log:\${log.WorkLogId || log.TaskId}:\${log.NextFollowUpDate}\`,
        section: 'followUp',
        title: dailyTaskTitle(data, task),
        body: compactText(log.Content || '今天需更新追蹤結果', 120),
        meta: \`下次追蹤 \${displayBriefDate(log.NextFollowUpDate)} / \${log.LogType || '工作歷程'}\`,
        task,
        tone: onOrBeforeLocalDate(log.NextFollowUpDate, addDays(today, -1)) ? 'bad' : 'warn'
      });
    });

  data.tasks
    .filter((task) =>
      unfinishedStatuses.includes(task.TaskStatus) &&
      (ownedTask(task) || (task.TaskStatus === STATUS_PENDING && canReview(user, task))) &&
      !followUpTaskIds.has(String(task.TaskId)) &&
      (onOrBeforeLocalDate(task.DueDate, today) || task.TaskStatus === STATUS_RETURNED || task.TaskStatus === STATUS_PENDING)
    )
    .sort((a, b) => String(a.DueDate || '').localeCompare(String(b.DueDate || '')))
    .slice(0, 8)
    .forEach((task) => {
      addItem({
        id: \`follow-task:\${task.TaskId}:\${task.TaskStatus}:\${task.DueDate}\`,
        section: 'followUp',
        title: dailyTaskTitle(data, task),
        body: task.TaskStatus === STATUS_RETURNED
          ? compactText(task.ResultReason || '退回任務需補下一步', 120)
          : task.TaskStatus === STATUS_PENDING
            ? '待主管覆判或確認結果'
            : '到期或逾期任務需更新進度',
        meta: [task.TaskStatus, task.DueDate ? \`期限 \${task.DueDate}\` : '未填期限'].filter(Boolean).join(' / '),
        task,
        tone: isOverdue(task) || task.TaskStatus === STATUS_RETURNED ? 'bad' : 'warn'
      });
    });

  data.tasks
    .filter((task) => ownedTask(task) && unfinishedStatuses.includes(task.TaskStatus))
    .filter((task) => {
      const hasYesterdayLog = logs.some((log) => String(log.TaskId || '') === String(task.TaskId) && (sameLocalDate(log.LogDate, yesterday) || sameLocalDate(log.CreatedAt, yesterday)));
      const hasYesterdayTransition = transitions.some((item) => String(item.TaskId || '') === String(task.TaskId) && sameLocalDate(String(item.CreatedAt || ''), yesterday));
      const hasYesterdayComment = comments.some((item) => String(item.TaskId || '') === String(task.TaskId) && sameLocalDate(String(item.CreatedAt || ''), yesterday));
      return !hasYesterdayLog && !hasYesterdayTransition && !hasYesterdayComment && (isOverdue(task) || task.TaskStatus === STATUS_RETURNED || onOrBeforeLocalDate(task.DueDate, today));
    })
    .slice(0, 5)
    .forEach((task) => {
      addItem({
        id: \`missing:\${task.TaskId}:\${task.UpdatedAt}\`,
        section: 'missing',
        title: dailyTaskTitle(data, task),
        body: '昨天沒有看到此任務的系統歷程，請補進度、下一步或追蹤日期。',
        meta: [task.TaskStatus, task.DueDate ? \`期限 \${task.DueDate}\` : '未填期限'].filter(Boolean).join(' / '),
        task,
        tone: 'bad'
      });
    });

  return {
    todayDate: formatLocalDate(today),
    targetDate: formatLocalDate(yesterday),
    items
  };
}

function loadConfirmedBriefItems(key: string) {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function dailyTaskTitle(data: AppData, task: Task) {
  const project = findTaskProject(data, task);
  const source = [task.TaskName, project?.ProjectName, project?.ItemCodes, task.ProjectCode].filter(Boolean).join(' ');
  const itemNo = source.match(/[A-Z]?\\d{4,}[A-Z]*/i)?.[0] || task.TaskCode;
  const rawName = String(project?.ProjectName || task.TaskName || '').replace(itemNo, '').replace(/[()（）]/g, ' ').trim();
  const shortName = compactText(rawName || task.TaskType || '任務', 12);
  return itemNo ? \`\${itemNo}(\${shortName})\` : shortName;
}

function startOfLocalDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseLocalDate(value: string) {
  const match = String(value || '').match(/(\\d{4})[/-](\\d{1,2})[/-](\\d{1,2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function sameLocalDate(value: string, target: Date) {
  const date = parseLocalDate(value);
  return Boolean(date && formatLocalDate(date) === formatLocalDate(target));
}

function onOrBeforeLocalDate(value: string, target: Date) {
  const date = parseLocalDate(value);
  return Boolean(date && startOfLocalDay(date).getTime() <= startOfLocalDay(target).getTime());
}

function formatLocalDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return \`\${date.getFullYear()}-\${month}-\${day}\`;
}

function displayBriefDate(value: string) {
  const date = parseLocalDate(value);
  return date ? formatLocalDate(date) : value || '';
}

function Metric({ label, value, tone = '' }: { label: string; value: number; tone?: string }) {`,
    'DailyBrief helpers'
  );
}

if (!styles.includes('.daily-brief {')) {
  styles = replaceRequired(
    styles,
    `@media (max-width: 1180px) {`,
    `.daily-brief {
  display: grid;
  gap: 14px;
  margin-bottom: 24px;
  border: 1px solid #cbd5df;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}
.daily-brief-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.daily-brief-head span {
  display: block;
  margin-top: 5px;
  color: #52616b;
  font-size: 13px;
}
.daily-brief-counters {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 2px 9px;
  align-items: baseline;
  min-width: 140px;
  text-align: right;
}
.daily-brief-counters strong {
  color: #245b74;
  font-size: 26px;
}
.daily-brief-counters span {
  margin: 0;
  color: #52616b;
  font-size: 12px;
  font-weight: 800;
}
.daily-brief-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.daily-brief-card {
  display: grid;
  gap: 10px;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  background: #fbfdff;
}
.daily-brief-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.daily-brief-card-head span {
  display: inline-flex;
  min-width: 26px;
  min-height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  background: #59636f;
  font-size: 12px;
  font-weight: 800;
}
.daily-brief-list {
  display: grid;
  gap: 9px;
}
.daily-brief-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  border-left: 4px solid #245b74;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}
.daily-brief-item.warn { border-left-color: #a35f00; }
.daily-brief-item.bad { border-left-color: #a23b3b; }
.daily-brief-item.ok { border-left-color: #1f7a4d; }
.daily-brief-item.confirmed {
  background: #f5fbf7;
}
.daily-brief-item strong {
  display: block;
  color: #22303a;
  font-size: 14px;
}
.daily-brief-item p {
  margin: 6px 0;
  color: #34495e;
  font-size: 13px;
  line-height: 1.45;
}
.daily-brief-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-content: flex-start;
  justify-content: flex-end;
}
.daily-brief-actions button {
  min-height: 34px;
  padding: 6px 10px;
  white-space: nowrap;
}
.daily-brief-empty {
  border: 1px dashed #cbd5df;
  border-radius: 8px;
  padding: 12px;
  color: #718096;
  background: #fff;
  font-size: 13px;
}

@media (max-width: 1180px) {`,
    'DailyBrief CSS'
  );
}

styles = replaceOnce(
  styles,
  `.metric-grid, .project-summary-grid, .task-filter-panel, .my-task-filter-panel, .project-filter-panel, .help-grid, .field-grid, .field-grid.compact, .project-form-grid { grid-template-columns: 1fr; }`,
  `.metric-grid, .project-summary-grid, .task-filter-panel, .my-task-filter-panel, .project-filter-panel, .help-grid, .field-grid, .field-grid.compact, .project-form-grid, .daily-brief-grid { grid-template-columns: 1fr; }`
);

if (!styles.includes('.daily-brief-head, .daily-brief-item { grid-template-columns: 1fr; }')) {
  styles = replaceRequired(
    styles,
    `  .task-card { grid-template-columns: 1fr; }
  .actions { justify-content: flex-start; }`,
    `  .task-card { grid-template-columns: 1fr; }
  .daily-brief-head, .daily-brief-item { grid-template-columns: 1fr; }
  .daily-brief-actions { justify-content: flex-start; }
  .actions { justify-content: flex-start; }`,
    'DailyBrief mobile CSS'
  );
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
