import fs from 'node:fs';

const apiPath = new URL('../src/api.ts', import.meta.url);
const appPath = new URL('../src/App.tsx', import.meta.url);

let api = fs.readFileSync(apiPath, 'utf8');
api = api.replace(
  /getAppData: \(token: string(?:, options: Record<string, unknown> = \{\})?\) => jsonp<AppData>\('getAppData', \{ Token: token, ActorEmail: token, IncludeActivityLogs: (?:true|false), IncludeImages: false(?:, \.\.\.options)? \}\),/,
  "getAppData: (token: string, options: Record<string, unknown> = {}) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false, ...options }),"
);
fs.writeFileSync(apiPath, api, 'utf8');

let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(/import type \{([^}]+)\} from '\.\/types';/, (match, names) => {
  const parts = names.split(',').map((part) => part.trim()).filter(Boolean);
  for (const required of ['MutationResult', 'TaskWorkLog']) {
    if (!parts.includes(required)) parts.push(required);
  }
  return `import type { ${parts.join(', ')} } from './types';`;
});

if (!app.includes('function approveReviewQuick')) {
  app = app.replace(
    `function TaskCards({ data, tasks, user, mode, setModal, applyData, token, openProject }: { data: AppData; tasks: Task[]; user: User; mode: 'assignee' | 'review'; setModal: (modal: ModalState) => void; applyData: (data: AppData) => void; token: string; openProject: (project: Project) => void }) {
`,
    `function TaskCards({ data, tasks, user, mode, setModal, applyData, token, openProject }: { data: AppData; tasks: Task[]; user: User; mode: 'assignee' | 'review'; setModal: (modal: ModalState) => void; applyData: (data: AppData) => void; token: string; openProject: (project: Project) => void }) {
  const [quickReview, setQuickReview] = useState<{ taskId: string; state: 'pending' | 'success' | 'error'; message: string } | null>(null);
  async function approveReviewQuick(task: Task) {
    const taskId = String(task.TaskId || '');
    if (quickReview?.state === 'pending') return;
    setQuickReview({ taskId, state: 'pending', message: '\u8986\u5224\u5b8c\u6210\u9001\u51fa\u4e2d...' });
    try {
      const result = await api.reviewTask(token, { TaskId: task.TaskId, Action: 'approve', Comment: 'PM \u8986\u5224\u5b8c\u6210' });
      applyData(mergeMutationIntoData(data, result));
      setQuickReview({ taskId, state: 'success', message: '\u5df2\u8986\u5224\u5b8c\u6210' });
      window.setTimeout(() => {
        setQuickReview((current) => current?.taskId === taskId && current.state === 'success' ? null : current);
      }, 3500);
    } catch (err) {
      setQuickReview({ taskId, state: 'error', message: cleanActionError(err) });
    }
  }
  const quickNotice = quickReview
    ? <div className={quickReview.state === 'error' ? 'error' : 'notice'}>{quickReview.message}</div>
    : null;
`
  );
}

app = app.replace(
  /if \(tasks\.length === 0\) return <div className="empty-card">.*?<\/div>;/,
  `if (tasks.length === 0) return <>{quickNotice}<div className="empty-card">{'\u6c92\u6709\u7b26\u5408\u689d\u4ef6\u7684\u4efb\u52d9\u3002'}</div></>;`
);
if (app.includes('<div className="task-list">') && !app.includes('<div className="task-list">\n      {quickNotice}')) {
  app = app.replace('<div className="task-list">', '<div className="task-list">\n      {quickNotice}');
}

if (!app.includes('function mergeMutationIntoData')) {
  const helper = `function mergeMutationIntoData(data: AppData, result: MutationResult): AppData {
  const mergeTask = (tasks: Task[], task?: Task | null) => {
    if (!task?.TaskId) return tasks;
    return tasks.some((item) => String(item.TaskId) === String(task.TaskId))
      ? tasks.map((item) => String(item.TaskId) === String(task.TaskId) ? task : item)
      : [task, ...tasks];
  };
  const mergeProject = (projects: Project[], project?: Project | null) => {
    if (!project?.ProjectId) return projects;
    return projects.some((item) => String(item.ProjectId) === String(project.ProjectId))
      ? projects.map((item) => String(item.ProjectId) === String(project.ProjectId) ? { ...project, ImageUrl: project.ImageUrl || item.ImageUrl } : item)
      : [project, ...projects];
  };
  const mergeWorkLog = (workLogs: TaskWorkLog[] | undefined, workLog?: TaskWorkLog | null) => {
    const current = workLogs || [];
    if (!workLog?.WorkLogId) return current;
    return current.some((item) => String(item.WorkLogId) === String(workLog.WorkLogId))
      ? current.map((item) => String(item.WorkLogId) === String(workLog.WorkLogId) ? workLog : item)
      : [workLog, ...current];
  };

  const next = {
    ...data,
    currentUser: result.currentUser || data.currentUser,
    projects: mergeProject(data.projects, result.project),
    tasks: mergeTask(mergeTask(data.tasks, result.task), result.nextTask),
    workLogs: mergeWorkLog(data.workLogs, result.workLog)
  };
  Object.defineProperty(next, '__pmMutationMergeMarker', {
    value: 'pm-v08-mutation-merge-v64',
    enumerable: false
  });
  return next;
}

`;
  if (app.includes('function normalizeMatchText')) {
    app = app.replace('function normalizeMatchText', `${helper}function normalizeMatchText`);
  } else {
    throw new Error('patch-v64: normalizeMatchText marker not found for mutation helper');
  }
}

app = app.replace(
  /applyData\(\s*await\s+api\.reviewTask\(\s*token\s*,\s*(\{[^{}]*TaskId:\s*task\.TaskId[^{}]*Action:\s*'approve'[^{}]*\})\s*\)\s*\)/g,
  'applyData(mergeMutationIntoData(data, await api.reviewTask(token, $1)))'
);

app = app.replace(
  /applyData\(\s*await\s+api\.reviewTask\(([^;]+?)\)\s*\)/g,
  'applyData(mergeMutationIntoData(data, await api.reviewTask($1)))'
);

app = app.replace(
  /next = await api\.(createTask|createTaskWorkLog|submitTaskResult|reviewTask|createFollowUpTask|editTask|voidTask)\(([^;]+)\);/g,
  'next = mergeMutationIntoData(data, await api.$1($2));'
);

app = app.replace(
  /\{task\.TaskResult === RESULT_DONE && <button className="ok"[^>]*onClick=\{[^}]*api\.reviewTask[^}]+\}[^<]*<\/button>\}/g,
  `{task.TaskResult === RESULT_DONE && <button className="ok" disabled={quickReview?.state === 'pending' && quickReview.taskId === String(task.TaskId || '')} onClick={() => approveReviewQuick(task)}>{quickReview?.state === 'pending' && quickReview.taskId === String(task.TaskId || '') ? '\u8986\u5224\u4e2d...' : '\u8986\u5224\u5b8c\u6210'}</button>}`
);

if (!app.includes('mergeMutationIntoData(data, await api.submitTaskResult')) {
  throw new Error('patch-v64: submitTaskResult mutation merge was not applied');
}
if (!app.includes('mergeMutationIntoData(data, await api.createTaskWorkLog')) {
  throw new Error('patch-v64: createTaskWorkLog mutation merge was not applied');
}
if (!app.includes('function approveReviewQuick')) {
  throw new Error('patch-v64: quick approve handler was not applied');
}
if (!app.includes('disabled={quickReview?.state')) {
  throw new Error('patch-v64: quick approve pending/disabled state was not applied');
}
if (!app.includes("setQuickReview({ taskId, state: 'success'")) {
  throw new Error('patch-v64: quick approve success feedback was not applied');
}
if (!app.includes('applyData(mergeMutationIntoData(data, result))')) {
  throw new Error('patch-v64: quick approve mutation result merge was not applied');
}
if (!app.includes('mergeMutationIntoData(data, await api.reviewTask')) {
  throw new Error('patch-v64: modal reviewTask mutation merge was not applied');
}
if (/applyData\(await api\.reviewTask/.test(app)) {
  throw new Error('patch-v64: direct reviewTask applyData remains');
}
if (/next = await api\.(createTask|createTaskWorkLog|submitTaskResult|reviewTask|createFollowUpTask|editTask|voidTask)\(/.test(app)) {
  throw new Error('patch-v64: direct mutation AppData assignment remains');
}

if (!app.includes('function applyAppData(next: AppData)')) {
  app = app.replace(
    `      setData(next);
      saveCachedAppData(token, next);
      setUser(next.currentUser);
      localStorage.setItem(userKey, JSON.stringify(next.currentUser));`,
    `      applyAppData(next);`
  );
  app = app.replace(
    `  function logout() {`,
    `  function applyAppData(next: AppData) {
    setData(next);
    if (token) saveCachedAppData(token, next);
    if (next.currentUser) {
      setUser(next.currentUser);
      localStorage.setItem(userKey, JSON.stringify(next.currentUser));
    }
  }

  function logout() {`
  );
}

app = app.replaceAll('applyData={setData}', 'applyData={applyAppData}');

app = app.replace(
  /<button className="light" onClick=\{refresh\}><RefreshCw size=\{16\} \/>[^<]*<\/button>/,
  `<button className="light" onClick={refresh} disabled={refreshing}><RefreshCw size={16} />{refreshing ? '同步最新資料中' : '重新整理'}</button>`
);

if (!app.includes('saveCachedAppData(token, next);\n        return next;')) {
  app = app.replace(
    `      setData((current) => {
        if (!current) return current;
        const mergedProject = { ...project, ...imageProject };
        return {
          ...current,
          projects: current.projects.map((item) =>
            String(item.ProjectId) === String(mergedProject.ProjectId) ? mergedProject : item
          )
        };
      });`,
    `      setData((current) => {
        if (!current) return current;
        const mergedProject = { ...project, ...imageProject };
        const next = {
          ...current,
          projects: current.projects.map((item) =>
            String(item.ProjectId) === String(mergedProject.ProjectId) ? mergedProject : item
          )
        };
        saveCachedAppData(token, next);
        return next;
      });`
  );
}

if (!app.includes('function applyAppData(next: AppData)')) {
  throw new Error('patch-v64: applyAppData cache sync was not applied');
}
if (app.includes('applyData={setData}')) {
  throw new Error('patch-v64: stale applyData={setData} remains');
}

fs.writeFileSync(appPath, app, 'utf8');
