import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function r(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

app = r(app, "const userKey = 'pm-v08-user';", "const userKey = 'pm-v08-user';\nconst readNotificationsKeyPrefix = 'pm-v08-read-notifications';");
app = r(app, "  const [projectFilter, setProjectFilter] = useState('');", "  const [projectFilter, setProjectFilter] = useState('');\n  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);");
app = r(app, "  useEffect(() => {\n    if (token) refresh();\n  }, [token]);", "  useEffect(() => {\n    if (token) {\n      refresh();\n      setReadNotificationIds(loadReadNotifications(token));\n    }\n  }, [token]);");
app = r(app, "  const notifications = getNotifications(data, user);\n  const allTasks = filterTasks(data.tasks, { keyword, statusFilter, assigneeFilter, projectFilter }, data);", "  const notifications = getNotifications(data, user);\n  const unreadNotifications = notifications.filter((task) => !readNotificationIds.includes(notificationKey(task)));\n  const allTasks = filterTasks(data.tasks, { keyword, statusFilter, assigneeFilter, projectFilter }, data);");
app = r(app, "  return (\n    <Shell user={user} view={view} setView={setView} logout={logout} notificationCount={notifications.length}>", "  function markNotificationsRead(tasks: Task[]) {\n    const next = Array.from(new Set([...readNotificationIds, ...tasks.map(notificationKey)]));\n    setReadNotificationIds(next);\n    localStorage.setItem(readNotificationsKey(token), JSON.stringify(next));\n  }\n\n  return (\n    <Shell user={user} view={view} setView={setView} logout={logout} notificationCount={unreadNotifications.length}>");
app = r(app, "{view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} setView={setView} />}", "{view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} unreadNotifications={unreadNotifications} markNotificationsRead={markNotificationsRead} setView={setView} />}");
app = r(app, "function Dashboard({ data, user, notifications, setView }: { data: AppData; user: User; notifications: Task[]; setView: (view: View) => void }) {", "function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, setView }: { data: AppData; user: User; notifications: Task[]; unreadNotifications: Task[]; markNotificationsRead: (tasks: Task[]) => void; setView: (view: View) => void }) {");
app = r(app, '<Metric label="登入提醒" value={notifications.length} tone={notifications.length ? \'warn\' : \'\'} />', '<Metric label="未讀提醒" value={unreadNotifications.length} tone={unreadNotifications.length ? \'warn\' : \'\'} />');
app = r(app, '<h3><Bell size={18} />登入提醒</h3>\n        <button className="light" onClick={() => setView(\'allTasks\')}>開啟任務清單</button>', '<h3><Bell size={18} />未讀提醒</h3>\n        <div className="actions">\n          {unreadNotifications.length > 0 && <button className="light" onClick={() => markNotificationsRead(unreadNotifications)}>全部標為已讀</button>}\n          <button className="light" onClick={() => setView(\'allTasks\')}>開啟任務清單</button>\n        </div>');
app = r(app, '<TaskTable data={data} tasks={notifications.slice(0, 8)} user={user} compact />', '<TaskTable data={data} tasks={unreadNotifications.slice(0, 8)} user={user} compact />\n      {unreadNotifications.length === 0 && notifications.length > 0 && <div className="empty-card">目前沒有未讀提醒；未完成任務仍會保留在任務清單。</div>}');

if (!app.includes('function notificationKey(')) {
  app = r(app, 'function canReview(user: User, task: Task) {', "function notificationKey(task: Task) {\n  return [\n    task.TaskId,\n    task.TaskStatus,\n    task.TaskResult,\n    task.ResultReason,\n    task.SubmittedAt,\n    task.UpdatedAt\n  ].map((value) => String(value || '').trim()).join('|');\n}\n\nfunction readNotificationsKey(token: string) {\n  return readNotificationsKeyPrefix + ':' + String(token || '').trim().toLowerCase();\n}\n\nfunction loadReadNotifications(token: string) {\n  try {\n    const value = localStorage.getItem(readNotificationsKey(token));\n    const parsed = value ? JSON.parse(value) : [];\n    return Array.isArray(parsed) ? parsed.map(String) : [];\n  } catch {\n    return [];\n  }\n}\n\nfunction canReview(user: User, task: Task) {");
}

fs.writeFileSync(appPath, app);
