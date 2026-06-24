import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);
const typesPath = new URL('../src/types.ts', import.meta.url);

let types = fs.readFileSync(typesPath, 'utf8');
if (!types.includes('export type TaskHistoryResult')) {
  types = types.replace(
    `export type MutationResult = {
  mutation: true;
  action?: string;
  currentUser?: User;
  project?: Project | null;
  task?: Task | null;
  nextTask?: Task | null;
  workLog?: TaskWorkLog | null;
  unchanged?: boolean;
};
`,
    `export type MutationResult = {
  mutation: true;
  action?: string;
  currentUser?: User;
  project?: Project | null;
  task?: Task | null;
  nextTask?: Task | null;
  workLog?: TaskWorkLog | null;
  unchanged?: boolean;
};

export type TaskHistoryResult = {
  currentUser?: User;
  task?: Task | null;
  workLogs?: TaskWorkLog[];
  transitions?: Record<string, string>[];
  comments?: Record<string, string>[];
};
`
  );
}
fs.writeFileSync(typesPath, types, 'utf8');

let api = fs.readFileSync(apiPath, 'utf8');
api = api.replace(
  /import type \{([^}]+)\} from '\.\/types';/,
  (match, names) => {
    const parts = names.split(',').map((part) => part.trim()).filter(Boolean);
    if (!parts.includes('TaskHistoryResult')) parts.push('TaskHistoryResult');
    return `import type { ${parts.join(', ')} } from './types';`;
  }
);
if (!api.includes("getTaskHistory: (token: string")) {
  api = api.replace(
    `  getAppData: (token: string, options: Record<string, unknown> = {}) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false, ...options }),`,
    `  getAppData: (token: string, options: Record<string, unknown> = {}) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false, ...options }),
  getTaskHistory: (token: string, payload: Record<string, unknown>) => jsonp<TaskHistoryResult>('getTaskHistory', { ...payload, Token: token, ActorEmail: token }),`
  );
}
fs.writeFileSync(apiPath, api, 'utf8');

let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/import type \{([^}]+)\} from '\.\/types';/, (match, names) => {
  const parts = names.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.includes('TaskHistoryResult')) parts.push('TaskHistoryResult');
  return `import type { ${parts.join(', ')} } from './types';`;
});

const historyEffectBlock = `  const [historySyncing, setHistorySyncing] = useState(false);
  const [historySyncError, setHistorySyncError] = useState('');
  const historySyncTaskRef = useRef('');

  useEffect(() => {
    if (modal.type !== 'history') return;
    const taskKey = String(modal.task.TaskId || modal.task.TaskCode || '');
    if (!taskKey || historySyncTaskRef.current === taskKey) return;
    historySyncTaskRef.current = taskKey;
    let cancelled = false;
    setHistorySyncing(true);
    setHistorySyncError('');
    api.getTaskHistory(token, { TaskId: modal.task.TaskId, TaskCode: modal.task.TaskCode })
      .then((result) => {
        if (!cancelled) applyData(mergeTaskHistoryIntoData(data, result));
      })
      .catch((err) => {
        if (!cancelled) setHistorySyncError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setHistorySyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modal, token, data, applyData]);

`;

if (!app.includes('const historySyncTaskRef = useRef')) {
  app = app.replace(
    `function ActionModal({ modal, data, token, close, applyData }: { modal: Exclude<ModalState, null>; data: AppData; token: string; close: () => void; applyData: (data: AppData) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
`,
    `function ActionModal({ modal, data, token, close, applyData }: { modal: Exclude<ModalState, null>; data: AppData; token: string; close: () => void; applyData: (data: AppData) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
${historyEffectBlock}`
  );
}

if (!app.includes('Syncing latest history...')) {
  app = app.replace(
    `          <div className="history-task-head">
            <strong>{modal.task.TaskCode}</strong>
            <span>{modal.task.TaskName}</span>
          </div>
`,
    `          <div className="history-task-head">
            <strong>{modal.task.TaskCode}</strong>
            <span>{modal.task.TaskName}</span>
          </div>
          {historySyncing && <div className="notice">Syncing latest history...</div>}
          {historySyncError && <div className="error">History sync failed: {historySyncError}</div>}
`
  );
}
if (!app.includes('function mergeTaskHistoryIntoData')) {
  const helper = `function mergeTaskHistoryIntoData(data: AppData, result: TaskHistoryResult): AppData {
  const mergeByKey = <T extends object>(
    current: T[] | undefined,
    incoming: T[] | undefined,
    key: string
  ) => {
    const byKey = new Map<string, T>();
    (current || []).forEach((item) => {
      const itemKey = String((item as Record<string, unknown>)[key] || '').trim();
      if (itemKey) byKey.set(itemKey, item);
    });
    (incoming || []).forEach((item) => {
      const itemKey = String((item as Record<string, unknown>)[key] || '').trim();
      if (itemKey) byKey.set(itemKey, item);
    });
    return Array.from(byKey.values());
  };
  const task = result.task || null;
  const tasks = task?.TaskId
    ? data.tasks.some((item) => String(item.TaskId) === String(task.TaskId))
      ? data.tasks.map((item) => String(item.TaskId) === String(task.TaskId) ? task : item)
      : [task, ...data.tasks]
    : data.tasks;
  return {
    ...data,
    currentUser: result.currentUser || data.currentUser,
    tasks,
    workLogs: mergeByKey(data.workLogs, result.workLogs, 'WorkLogId'),
    transitions: mergeByKey(data.transitions, result.transitions, 'TransitionId'),
    comments: mergeByKey(data.comments, result.comments, 'CommentId')
  };
}

`;
  app = app.replace('function normalizeMatchText', `${helper}function normalizeMatchText`);
}

const heavyHistoryPattern = new RegExp([
  '    api\\.getAppData\\(token,\\s*\\{\\s*',
  'IncludeActivityLogs',
  '\\s*:\\s*',
  'true',
  '\\s*\\}\\)\\n',
  '      \\.then\\(\\(next\\) => \\{\\n',
  '        if \\(!cancelled\\) applyData\\(next\\);\\n',
  '      \\}\\)'
].join(''));

app = app.replace(
  heavyHistoryPattern,
  `    api.getTaskHistory(token, { TaskId: modal.task.TaskId, TaskCode: modal.task.TaskCode })
      .then((result) => {
        if (!cancelled) applyData(mergeTaskHistoryIntoData(data, result));
      })`
);
app = app.replace(
  `  }, [modal, token, applyData]);`,
  `  }, [modal, token, data, applyData]);`
);

if (heavyHistoryPattern.test(app)) {
  throw new Error('patch-v65: heavy history getAppData fallback remains');
}
if (!app.includes('api.getTaskHistory(token, { TaskId: modal.task.TaskId, TaskCode: modal.task.TaskCode })')) {
  throw new Error('patch-v65: getTaskHistory history modal call was not applied');
}
if (!app.includes('function mergeTaskHistoryIntoData')) {
  throw new Error('patch-v65: mergeTaskHistoryIntoData helper missing');
}

fs.writeFileSync(appPath, app, 'utf8');
