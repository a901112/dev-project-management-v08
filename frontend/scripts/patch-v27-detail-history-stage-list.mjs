import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const cssPath = new URL('../src/styles.css', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

function replaceOnce(source, from, to) {
  if (!source.includes(from)) return source;
  return source.replace(from, to);
}

app = replaceOnce(
  app,
  "<Projects data={data} setModal={setModal} openProject={openProject} />",
  "<Projects data={data} setModal={setModal} openProject={openProject} token={token} applyData={setData} />"
);

app = replaceOnce(
  app,
  "function Projects({ data, setModal, openProject }: { data: AppData; setModal: (modal: ModalState) => void; openProject: (project: Project) => void }) {",
  "function Projects({ data, setModal, openProject, token, applyData }: { data: AppData; setModal: (modal: ModalState) => void; openProject: (project: Project) => void; token: string; applyData: (data: AppData) => void }) {"
);

app = replaceOnce(
  app,
  "<span><Status status={project.Stage || '-'} /></span>",
  "<span><ProjectStageCell project={project} user={data.currentUser} token={token} applyData={applyData} /></span>"
);

if (!app.includes('function ProjectStageCell(')) {
  app = app.replace(
    'function ProjectDetail(',
    `function ProjectStageCell({ project, user, token, applyData }: { project: Project; user: User; token: string; applyData: (data: AppData) => void }) {
  const [saving, setSaving] = useState(false);
  if (!canManageProjects(user)) return <Status status={project.Stage || '-'} />;
  async function changeStage(stage: string) {
    if (!stage || stage === project.Stage) return;
    setSaving(true);
    try {
      applyData(await api.updateProject(token, projectPayload(project, { Stage: stage })));
    } finally {
      setSaving(false);
    }
  }
  return (
    <select className="project-stage-select" value={project.Stage || projectStages[0]} onChange={(event) => void changeStage(event.target.value)} disabled={saving} title={saving ? '\\u5132\\u5b58\\u4e2d' : '\\u9ede\\u9078\\u53ef\\u8abf\\u6574\\u4e3b\\u968e\\u6bb5'}>
      {projectStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
    </select>
  );
}

function ProjectDetail(`
  );
}

app = app.replace(
  /\{canQuickEditProject \? \(\s*<InlineStageEditor project=\{project\} token=\{token\} applyData=\{applyData\} \/>\s*\) : \(\s*<div className="stage-track">\{projectStages\.map\(\(stage\) => <span key=\{stage\} className=\{project\.Stage === stage \? 'active' : ''\}>\{stage\.replace\('[^']*', ''\)\}<\/span>\)\}<\/div>\s*\)\}/,
  `<div className="stage-track">{projectStages.map((stage) => <span key={stage} className={project.Stage === stage ? 'active' : ''}>{stage.replace('\\u4e2d', '')}</span>)}</div>`
);

const historyCall = '<ProjectHistoryPanel histories={detailHistories} token={token} applyData={applyData} canEdit={canQuickEditProject} />';
if (app.includes(historyCall) && !app.includes('project-detail-v27-history-swapped')) {
  const summaryPattern = new RegExp('\\n\\s*<section className="detail-panel">\\s*<h3>\\u5c08\\u6848\\u6458\\u8981\\u5224\\u65b7<\\/h3>[\\s\\S]*?\\n\\s*<\\/section>');
  const match = app.match(summaryPattern);
  if (match) {
    const summarySection = match[0];
    const placeholder = '\\n          <div className="project-detail-v27-history-swapped" />';
    app = app.replace(summarySection, placeholder);
    app = app.replace(historyCall, summarySection);
    app = app.replace(placeholder, `\\n          ${historyCall}`);
  }
}

app = app.replace(
  /function ProjectHistoryPanel\(\{ histories, token, applyData, canEdit \}: \{ histories: Array<Record<string, string>>; token: string; applyData: \(data: AppData\) => void; canEdit: boolean \}\) \{[\s\S]*?\n\}\n\nfunction Info/,
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
      </div>
      <div className="history-list">
        {histories.slice(0, 8).map((history, index) => {
          const key = (history.ProjectCode || '') + '-' + (history.MatchedItemCode || history.SourceItemNo || '-') + '-' + (history.SourceRows || index);
          const text = String(history.HistorySummary || history.HistoryRaw || '');
          const lines = text.split('\\n').map((line) => line.trim()).filter(Boolean).slice(0, 10);
          return (
            <article className={\`history-card history-summary-only \${canEdit ? 'editable' : ''}\`} key={key}>
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

if (!css.includes('.project-stage-select')) {
  css += `

.project-stage-select {
  width: 100%;
  max-width: 86px;
  min-height: 28px;
  border: 1px solid #cbd5df;
  border-radius: 999px;
  padding: 3px 22px 3px 9px;
  color: #fff;
  background: #59636f;
  font-size: 12px;
  font-weight: 800;
}
.project-stage-select:disabled {
  opacity: 0.72;
}
.history-card.history-summary-only ul {
  margin-top: 0;
}
.history-card.history-summary-only {
  padding-top: 9px;
}
.project-photo-panel > .detail-panel,
.project-photo-panel > section.detail-panel {
  margin-top: 14px;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(cssPath, css);
