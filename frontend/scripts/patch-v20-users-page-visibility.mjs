import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('function canViewUsersPage')) {
  app = app.replace(
    `  useEffect(() => {
    if (token) {
      refresh();
      setReadNotificationIds(loadReadNotifications(token));
    }
  }, [token]);
`,
    `  useEffect(() => {
    if (token) {
      refresh();
      setReadNotificationIds(loadReadNotifications(token));
    }
  }, [token]);

  useEffect(() => {
    if (user && view === 'users' && !canViewUsersPage(user)) setView('dashboard');
  }, [user, view]);
`
  );

  app = app.replace(
    `{view === 'users' && <Users data={data} />}`,
    `{view === 'users' && canViewUsersPage(user) && <Users data={data} />}`
  );

  app = app.replace(
    `}) {
  return (
    <div className="app-shell">`,
    `}) {
  const visibleNavItems = navItems.filter((item) => item.view !== 'users' || canViewUsersPage(user));
  return (
    <div className="app-shell">`
  );

  app = app.replace(
    `{navItems.map((item) => {`,
    `{visibleNavItems.map((item) => {`
  );

  app = app.replace(
    `function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, openProject, setView }:`,
    `function canViewUsersPage(user: User) {
  const account = String(user.Account || '').trim().toLowerCase();
  return account === '000' || account === 'mis';
}

function Dashboard({ data, user, notifications, unreadNotifications, markNotificationsRead, openProject, setView }:`
  );
}

fs.writeFileSync(appPath, app);
