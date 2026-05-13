import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const cssPath = new URL('../src/styles.css', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

app = app.replaceAll('{"\\\\n          "}', '');
app = app.replaceAll('{"\\n          "}', '');

app = app.replace(
  /function ProjectHistoryPanel\(\{ histories, token, applyData, canEdit \}: \{ histories: Array<Record<string, string>>; token: string; applyData: \(data: AppData\) => void; canEdit: boolean \}\) \{[\s\S]*?\n\}\n\nfunction Info/,
  `function ProjectHistoryPanel({ histories, token, applyData, canEdit }: { histories: Array<Record<string, string>>; token: string; applyData: (data: AppData) => void; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const text = histories.map((history) => String(history.HistorySummary || history.HistoryRaw || '').trim()).filter(Boolean).join('\\n\\n');
  if (!histories.length) {
    return <div className="history-empty">{'\\u5c1a\\u672a\\u5c0d\\u61c9\\u5230\\u820a\\u7e3d\\u8868\\u6b77\\u7a0b\\u3002'}</div>;
  }
  async function save() {
    const next = draft.trim();
    setEditing(false);
    if (!canEdit || next === text.trim()) return;
    const first = histories[0];
    setSaving(true);
    try {
      applyData(await api.updateProjectHistory(token, {
        ProjectCode: first.ProjectCode,
        MatchedItemCode: first.MatchedItemCode,
        SourceRows: first.SourceRows,
        HistorySummary: next
      }));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="project-history-panel">
      <div className="section-heading in-panel">
        <h3>{'\\u958b\\u767c\\u6b77\\u7a0b\\u6458\\u8981'}</h3>
      </div>
      {editing ? (
        <textarea
          className="inline-history-editor history-single-editor"
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void save()}
        />
      ) : (
        <div
          className={\`history-single-block \${canEdit ? 'editable' : ''}\`}
          onClick={() => {
            if (!canEdit) return;
            setEditing(true);
            setDraft(text);
          }}
        >
          {text ? text.split('\\n').map((line, index) => <p key={index}>{line || '\\u00a0'}</p>) : <p>{'\\u5c1a\\u672a\\u6574\\u7406\\u6458\\u8981'}</p>}
        </div>
      )}
      {saving && <div className="inline-save-hint">{'\\u5132\\u5b58\\u4e2d...'}</div>}
    </div>
  );
}

function Info`
);

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
fs.writeFileSync(cssPath, css);
