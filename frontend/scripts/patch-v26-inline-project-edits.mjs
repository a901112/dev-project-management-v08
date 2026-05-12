import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);
const cssPath = new URL('../src/styles.css', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

if (!api.includes('updateProjectHistory:')) {
  api = api.replace(
    "  updateProject: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProject', { ...payload, ActorEmail: token }),",
    "  updateProject: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProject', { ...payload, ActorEmail: token }),\n  updateProjectHistory: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProjectHistory', { ...payload, ActorEmail: token }),"
  );
}

if (!app.includes('const canQuickEditProject = canManageProjects(data.currentUser);')) {
  app = app.replace(
    '  const projectOpenDate = getProjectOpenDate(project, orderLines);\n  const detailHistories = projectHistoriesForProject(data, project);',
    '  const projectOpenDate = getProjectOpenDate(project, orderLines);\n  const detailHistories = projectHistoriesForProject(data, project);\n  const canQuickEditProject = canManageProjects(data.currentUser);'
  );
}

if (!app.includes('<ProjectHistoryPanel histories={detailHistories} token={token} applyData={applyData} canEdit={canQuickEditProject} />')) {
  app = app.replace(
    '<ProjectHistoryPanel histories={detailHistories} />',
    '<ProjectHistoryPanel histories={detailHistories} token={token} applyData={applyData} canEdit={canQuickEditProject} />'
  );
}

if (!app.includes('<InlineStageEditor')) {
  app = app.replace(
    `<div className="stage-track">{projectStages.map((stage) => <span key={stage} className={project.Stage === stage ? 'active' : ''}>{stage.replace('中', '')}</span>)}</div>`,
    `{canQuickEditProject ? (
          <InlineStageEditor project={project} token={token} applyData={applyData} />
        ) : (
          <div className="stage-track">{projectStages.map((stage) => <span key={stage} className={project.Stage === stage ? 'active' : ''}>{stage.replace('中', '')}</span>)}</div>
        )}`
  );
}

if (!app.includes('function InlineStageEditor(')) {
  app = app.replace(
    'function ProjectHistoryPanel(',
    `function InlineStageEditor({ project, token, applyData }: { project: Project; token: string; applyData: (data: AppData) => void }) {
  const [saving, setSaving] = useState(false);
  async function changeStage(stage: string) {
    if (stage === project.Stage) return;
    setSaving(true);
    try {
      applyData(await api.updateProject(token, projectPayload(project, { Stage: stage })));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="inline-stage-editor">
      <select value={project.Stage || projectStages[0]} onChange={(event) => void changeStage(event.target.value)} disabled={saving}>
        {projectStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
      </select>
      <small>{saving ? '\\u5132\\u5b58\\u4e2d...' : '\\u9078\\u64c7\\u5f8c\\u81ea\\u52d5\\u5132\\u5b58'}</small>
    </div>
  );
}

function ProjectHistoryPanel(`
  );
}

app = app.replace(
  /function ProjectHistoryPanel\(\{ histories \}: \{ histories: Array<Record<string, string>> \}\) \{[\s\S]*?\n\}\n\nfunction Info/,
  `function ProjectHistoryPanel({ histories, token, applyData, canEdit }: { histories: Array<Record<string, string>>; token: string; applyData: (data: AppData) => void; canEdit: boolean }) {
  const [editingKey, setEditingKey] = useState('');
  const [draft, setDraft] = useState('');
  const [savingKey, setSavingKey] = useState('');
  if (!histories.length) {
    return <div className="history-empty">{'\\u5c1a\\u672a\\u5c0d\\u61c9\\u5230\\u820a\\u7e3d\\u8868\\u6b77\\u7a0b\\u3002'}</div>;
  }
  async function save(history: Record<string, string>, key: string) {
    const next = draft.trim();
    const current = String(history.HistorySummary || history.HistoryRaw || '').trim();
    setEditingKey('');
    if (!canEdit || next === current) return;
    setSavingKey(key);
    try {
      applyData(await api.updateProjectHistory(token, {
        ProjectCode: history.ProjectCode,
        MatchedItemCode: history.MatchedItemCode,
        SourceRows: history.SourceRows,
        HistorySummary: next
      }));
    } finally {
      setSavingKey('');
    }
  }
  return (
    <div className="project-history-panel">
      <div className="section-heading in-panel">
        <h3>{'\\u958b\\u767c\\u6b77\\u7a0b\\u6458\\u8981'}</h3>
        <span className="muted">{canEdit ? '\\u9ede\\u9078\\u5167\\u5bb9\\u53ef\\u5feb\\u901f\\u7de8\\u8f2f\\uff0c\\u96e2\\u958b\\u5f8c\\u81ea\\u52d5\\u5132\\u5b58' : '\\u4f86\\u6e90\\uff1a\\u52c7\\u78a9\\u958b\\u767c\\u5c08\\u6848 / AC \\u6b04\\u8a3b\\u89e3'}</span>
      </div>
      <div className="history-list">
        {histories.slice(0, 8).map((history, index) => {
          const key = (history.ProjectCode || '') + '-' + (history.MatchedItemCode || history.SourceItemNo || '-') + '-' + (history.SourceRows || index);
          const text = String(history.HistorySummary || history.HistoryRaw || '');
          const lines = text.split('\\n').map((line) => line.trim()).filter(Boolean).slice(0, 10);
          return (
            <article className={\`history-card \${canEdit ? 'editable' : ''}\`} key={key}>
              <div className="history-card-head">
                <strong>{history.MatchedItemCode || history.SourceItemNo || '-'}</strong>
                {history.Progress && <em>{history.Progress}</em>}
              </div>
              <small>{[history.SourceItemNo, history.CustomerItemNo, history.ItemName].filter(Boolean).join(' / ')}</small>
              {editingKey === key ? (
                <textarea
                  className="inline-history-editor"
                  autoFocus
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onBlur={() => void save(history, key)}
                />
              ) : (
                <ul onClick={() => {
                  if (!canEdit) return;
                  setEditingKey(key);
                  setDraft(text);
                }}>{lines.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}</ul>
              )}
              {savingKey === key && <div className="inline-save-hint">{'\\u5132\\u5b58\\u4e2d...'}</div>}
            </article>
          );
        })}
      </div>
      {histories.length > 8 && <div className="history-more">{'\\u9084\\u6709 '}{histories.length - 8}{' \\u7b46\\u54c1\\u9805\\u6b77\\u7a0b\\u672a\\u986f\\u793a'}</div>}
    </div>
  );
}

function Info`
);

if (!app.includes("return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';")) {
  app = app.replace(
    "  return date ? date.toISOString().slice(0, 10) : '';",
    "  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';"
  );
}

if (!css.includes('.inline-stage-editor')) {
  css += `

.inline-stage-editor {
  display: flex;
  align-items: center;
  gap: 10px;
}
.inline-stage-editor select {
  width: min(260px, 100%);
  min-height: 38px;
  border: 1px solid #cbd5df;
  border-radius: 7px;
  padding: 6px 10px;
  font-weight: 800;
}
.inline-stage-editor small,
.inline-save-hint {
  color: #718096;
  font-size: 12px;
}
.history-card.editable ul {
  cursor: text;
}
.history-card.editable:hover {
  border-color: #8fb8cb;
  background: #f7fbfd;
}
.inline-history-editor {
  width: 100%;
  min-height: 138px;
  margin-top: 8px;
  border: 1px solid #8fb8cb;
  border-radius: 7px;
  padding: 8px 10px;
  color: #22303a;
  line-height: 1.5;
  font-size: 13px;
  resize: vertical;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(apiPath, api);
fs.writeFileSync(cssPath, css);
