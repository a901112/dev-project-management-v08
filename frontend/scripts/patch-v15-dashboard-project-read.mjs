import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function r(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

app = r(app, `  function openProject(project: Project) {
    setSelectedProjectId(project.ProjectId);
    setView('projectDetail');
  }`, `  function openProject(project: Project) {
    if (data && user && token) {
      const projectNotifications = getNotifications(data, user).filter((task) =>
        String(task.ProjectId) === String(project.ProjectId) || task.ProjectCode === project.ProjectCode
      );
      const next = Array.from(new Set([...readNotificationIds, ...projectNotifications.map(notificationKey)]));
      setReadNotificationIds(next);
      localStorage.setItem(readNotificationsKey(token), JSON.stringify(next));
    }
    setSelectedProjectId(project.ProjectId);
    setView('projectDetail');
  }`);

app = r(app, `{view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} unreadNotifications={unreadNotifications} markNotificationsRead={markNotificationsRead} setView={setView} />}`, `{view === 'dashboard' && <Dashboard data={data} user={user} notifications={notifications} unreadNotifications={unreadNotifications} markNotificationsRead={markNotificationsRead} openProject={openProject} setView={setView} />}`);

app = r(app, `function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, setView }: { data: AppData; user: User; notifications: Task[]; unreadNotifications: Task[]; markNotificationsRead: (tasks: Task[]) => void; setView: (view: View) => void }) {`, `function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, openProject, setView }: { data: AppData; user: User; notifications: Task[]; unreadNotifications: Task[]; markNotificationsRead: (tasks: Task[]) => void; openProject: (project: Project) => void; setView: (view: View) => void }) {`);

app = r(app, `<TaskTable data={data} tasks={unreadNotifications.slice(0, 8)} user={user} compact />`, `<TaskTable data={data} tasks={unreadNotifications.slice(0, 8)} user={user} openProject={openProject} compact />`);

fs.writeFileSync(appPath, app);
