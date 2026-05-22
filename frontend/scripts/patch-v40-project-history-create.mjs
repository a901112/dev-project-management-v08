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

app = app.replaceAll(
  '<ProjectHistoryPanel histories={detailHistories} token={token} applyData={applyData} canEdit={canQuickEditProject} />',
  '<ProjectHistoryPanel project={project} histories={detailHistories} token={token} applyData={applyData} canEdit={canQuickEditProject} />'
);
app = app.replaceAll(
  '<ProjectHistoryPanel histories={detailHistories} />',
  '<ProjectHistoryPanel project={project} histories={detailHistories} token={token} applyData={applyData} canEdit={canManageProjects(data.currentUser)} />'
);

const panelPattern =
  /function ProjectHistoryPanel\([\s\S]*?\n\}\n\nfunction Info/;

const nextPanel = `function ProjectHistoryPanel({ project, histories, token, applyData, canEdit }: { project: Project; histories: Array<Record<string, string>>; token: string; applyData: (data: AppData) => void; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const projectText = String(project.HistorySummary || '').trim();
  const importedText = histories.map((history) => String(history.HistorySummary || history.HistoryRaw || '').trim()).filter(Boolean).join('\\n\\n');
  const text = projectText || importedText;

  async function save() {
    const next = draft.trim();
    setEditing(false);
    if (!canEdit || next === projectText) return;
    setSaving(true);
    try {
      applyData(await api.updateProjectHistory(token, {
        ProjectId: project.ProjectId,
        ProjectCode: project.ProjectCode,
        HistorySummary: next
      }));
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    if (!canEdit) return;
    setDraft(text);
    setEditing(true);
  }

  return (
    <div className="project-history-panel">
      <div className="section-heading in-panel">
        <h3>{'開發歷程摘要'}</h3>
        {canEdit && !editing && <button className="light compact-action" onClick={startEdit}>{text ? '編輯歷程' : '新增歷程'}</button>}
      </div>
      {editing ? (
        <textarea
          className="inline-history-editor history-single-editor"
          autoFocus
          value={draft}
          placeholder="請輸入此專案的開發歷程，例如：5/22 已請供應商估價，待回覆。"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void save()}
        />
      ) : (
        <div className={\`history-single-block \${canEdit ? 'editable' : ''}\`} onClick={startEdit}>
          {text ? text.split('\\n').map((line, index) => <p key={index}>{line || '\\u00a0'}</p>) : <p>{canEdit ? '尚未建立歷程，點選此處或右上角新增歷程。' : '尚未建立歷程。'}</p>}
        </div>
      )}
      {saving && <div className="inline-save-hint">{'儲存中...'}</div>}
    </div>
  );
}

function Info`;

if (panelPattern.test(app)) {
  app = app.replace(panelPattern, nextPanel);
}

if (!css.includes('.compact-action')) {
  css += `

.compact-action {
  min-height: 30px;
  padding: 5px 10px;
  font-size: 13px;
}
`;
}

if (!css.includes('.history-single-block')) {
  css += `

.history-single-block {
  min-height: 300px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fbfdff;
  color: #34424c;
  line-height: 1.55;
  font-size: 13px;
  white-space: pre-wrap;
}
.history-single-block.editable {
  cursor: text;
}
.history-single-block.editable:hover {
  border-color: #8fb8cb;
  background: #f7fbfd;
}
.history-single-block p {
  margin: 0 0 5px;
}
.history-single-editor {
  min-height: 300px;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(apiPath, api);
fs.writeFileSync(cssPath, css);
