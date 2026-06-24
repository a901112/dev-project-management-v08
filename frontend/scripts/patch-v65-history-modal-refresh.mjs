import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

if (!app.includes('const historySyncTaskRef = useRef')) {
  app = app.replace(
    `function ActionModal({ modal, data, token, close, applyData }: { modal: Exclude<ModalState, null>; data: AppData; token: string; close: () => void; applyData: (data: AppData) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
`,
    `function ActionModal({ modal, data, token, close, applyData }: { modal: Exclude<ModalState, null>; data: AppData; token: string; close: () => void; applyData: (data: AppData) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [historySyncing, setHistorySyncing] = useState(false);
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
    api.getAppData(token, { IncludeActivityLogs: true })
      .then((next) => {
        if (!cancelled) applyData(next);
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
  }, [modal, token, applyData]);
`
  );
}

if (!app.includes('同步最新歷程中...')) {
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
          {historySyncing && <div className="notice">同步最新歷程中...</div>}
          {historySyncError && <div className="error">歷程同步失敗：{historySyncError}</div>}
`
  );
}

if (!app.includes('api.getAppData(token, { IncludeActivityLogs: true })')) {
  throw new Error('patch-v65: history modal refresh was not applied');
}
if (!app.includes('同步最新歷程中...')) {
  throw new Error('patch-v65: history sync notice was not applied');
}

fs.writeFileSync(appPath, app, 'utf8');
