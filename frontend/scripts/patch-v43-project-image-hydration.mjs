import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

api = replaceOnce(
  api,
  "  getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true }),",
  "  getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false }),\n  getProjectImage: (token: string, payload: Record<string, unknown>) => jsonp<Project>('getProjectImage', { ...payload, ActorEmail: token }),"
);

if (!app.includes('async function hydrateProjectImage(')) {
  app = replaceOnce(
    app,
    `  function openProject(project: Project) {
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
  }`,
    `  async function hydrateProjectImage(project: Project) {
    if (!token || String(project.ImageUrl || '').trim()) return;
    try {
      const imageProject = await api.getProjectImage(token, {
        ProjectId: project.ProjectId,
        ProjectCode: project.ProjectCode
      });
      if (!String(imageProject.ImageUrl || '').trim()) return;
      setData((current) => current ? mergeProjectIntoData(current, { ...project, ...imageProject }) : current);
    } catch (err) {
      console.warn('Unable to load project image', err);
    }
  }

  function openProject(project: Project) {
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
    void hydrateProjectImage(project);
  }`
  );
}

if (!app.includes('function normalizedProjectImageUrl(')) {
  app = app.replace(
    'function ProjectImage(',
    `function normalizedProjectImageUrl(value: string | undefined) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (driveMatch && driveMatch[1]) {
    return \`https://drive.google.com/thumbnail?id=\${encodeURIComponent(driveMatch[1])}&sz=w1200\`;
  }
  return url;
}

function ProjectImage(`
  );
}

app = replaceOnce(
  app,
  "  const url = String(project.ImageUrl || '').trim();",
  "  const url = normalizedProjectImageUrl(project.ImageUrl);"
);

app = replaceOnce(
  app,
  '  return <img className={`project-image ${variant}`} src={url} alt={project.ProjectName || project.ProjectCode} loading="lazy" />;',
  `  return <img className={\`project-image \${variant}\`} src={url} alt={project.ProjectName || project.ProjectCode} loading="lazy" onError={(event) => {
    event.currentTarget.style.display = 'none';
  }} />;`
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(apiPath, api);
