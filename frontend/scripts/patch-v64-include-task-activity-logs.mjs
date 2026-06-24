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

  return {
    ...data,
    currentUser: result.currentUser || data.currentUser,
    projects: mergeProject(data.projects, result.project),
    tasks: mergeTask(mergeTask(data.tasks, result.task), result.nextTask),
    workLogs: mergeWorkLog(data.workLogs, result.workLog)
  };
}

`;
  if (app.includes('function normalizeMatchText')) {
    app = app.replace('function normalizeMatchText', `${helper}function normalizeMatchText`);
  } else {
    throw new Error('patch-v64: normalizeMatchText marker not found for mutation helper');
  }
}

app = app.replace(
  /applyData\(await api\.reviewTask\(token, \{ TaskId: task\.TaskId, Action: 'approve', Comment: ([^}]+) \}\)\)\)/g,
  "applyData(mergeMutationIntoData(data, await api.reviewTask(token, { TaskId: task.TaskId, Action: 'approve', Comment: $1 })))"
);

app = app.replace(
  /next = await api\.(createTask|createTaskWorkLog|submitTaskResult|reviewTask|createFollowUpTask|editTask|voidTask)\(([^;]+)\);/g,
  'next = mergeMutationIntoData(data, await api.$1($2));'
);

if (!app.includes('mergeMutationIntoData(data, await api.submitTaskResult')) {
  throw new Error('patch-v64: submitTaskResult mutation merge was not applied');
}
if (!app.includes('mergeMutationIntoData(data, await api.createTaskWorkLog')) {
  throw new Error('patch-v64: createTaskWorkLog mutation merge was not applied');
}

fs.writeFileSync(appPath, app, 'utf8');
