import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const cssPath = new URL('../src/styles.css', import.meta.url);
const typesPath = new URL('../src/types.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');
let types = fs.readFileSync(typesPath, 'utf8');

if (!types.includes('export type ProjectHistory')) {
  types = types.replace(
    'export type ErpOrderLine = {',
    `export type ProjectHistory = {
  ProjectCode: string;
  ProjectItemCodes: string;
  MatchedItemCode: string;
  SourceItemNo: string;
  CustomerItemNo: string;
  ItemName: string;
  Spec: string;
  Progress: string;
  HistorySummary: string;
  HistoryRaw: string;
  SourceRows: string;
  SourceUpdatedAt: string;
};

export type ErpOrderLine = {`
  );
}

if (!types.includes('projectHistories?: ProjectHistory[];')) {
  types = types.replace(
    '  erpOrderLines?: ErpOrderLine[];\n',
    '  erpOrderLines?: ErpOrderLine[];\n  projectHistories?: ProjectHistory[];\n'
  );
}

if (!app.includes('const histories = projectHistoriesForProject(data, project);')) {
  app = app.replace(
    '  const projectOpenDate = getProjectOpenDate(project, orderLines);',
    '  const projectOpenDate = getProjectOpenDate(project, orderLines);\n  const histories = projectHistoriesForProject(data, project);'
  );
}

if (!app.includes('<ProjectHistoryPanel histories={histories} />')) {
  app = app.replace(
    '<div className="project-visual-block"><ProjectImage project={project} variant="hero" /></div>',
    '<div className="project-visual-block"><ProjectImage project={project} variant="hero" /></div>\n          <ProjectHistoryPanel histories={histories} />'
  );
}

if (!app.includes('function ProjectHistoryPanel(')) {
  app = app.replace(
    'function Info({ label, value }: { label: string; value: ReactNode }) {',
    `function ProjectHistoryPanel({ histories }: { histories: Array<Record<string, string>> }) {
  if (!histories.length) {
    return <div className="history-empty">{'\\u5c1a\\u672a\\u5c0d\\u61c9\\u5230\\u820a\\u7e3d\\u8868\\u6b77\\u7a0b\\u3002'}</div>;
  }
  return (
    <div className="project-history-panel">
      <div className="section-heading in-panel">
        <h3>{'\\u958b\\u767c\\u6b77\\u7a0b\\u6458\\u8981'}</h3>
        <span className="muted">{'\\u4f86\\u6e90\\uff1a\\u52c7\\u78a9\\u958b\\u767c\\u5c08\\u6848 / AC \\u6b04\\u8a3b\\u89e3'}</span>
      </div>
      <div className="history-list">
        {histories.slice(0, 8).map((history, index) => {
          const lines = String(history.HistorySummary || history.HistoryRaw || '').split('\\n').map((line) => line.trim()).filter(Boolean).slice(0, 10);
          return (
            <article className="history-card" key={` + "`" + `${history.MatchedItemCode || history.SourceItemNo}-${index}` + "`" + `}>
              <div className="history-card-head">
                <strong>{history.MatchedItemCode || history.SourceItemNo || '-'}</strong>
                {history.Progress && <em>{history.Progress}</em>}
              </div>
              <small>{[history.SourceItemNo, history.CustomerItemNo, history.ItemName].filter(Boolean).join(' / ')}</small>
              <ul>{lines.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}</ul>
            </article>
          );
        })}
      </div>
      {histories.length > 8 && <div className="history-more">{'\\u9084\\u6709 '}{histories.length - 8}{' \\u7b46\\u54c1\\u9805\\u6b77\\u7a0b\\u672a\\u986f\\u793a'}</div>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {`
  );
}

if (!app.includes('function projectHistoriesForProject(')) {
  app = app.replace(
    'function projectTasks(data: AppData, project: Project) {',
    `function projectHistoriesForProject(data: AppData, project: Project) {
  const rows = data.projectHistories || [];
  const projectItems = new Set(splitItemCodes(project.ItemCodes).map(normalizeProjectItemCode).filter(Boolean));
  return rows.filter((row) => {
    if (row.ProjectCode === project.ProjectCode) return true;
    const matched = normalizeProjectItemCode(row.MatchedItemCode || row.SourceItemNo || '');
    return matched && projectItems.has(matched);
  });
}

function projectTasks(data: AppData, project: Project) {`
  );
}

if (!app.includes('function normalizeProjectItemCode(')) {
  app = app.replace(
    'function splitItemCodes(value: string) {',
    `function normalizeProjectItemCode(value: string) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function splitItemCodes(value: string) {`
  );
}

if (!css.includes('.project-history-panel')) {
  css += `

.project-photo-panel .project-image.hero {
  height: clamp(260px, 30vw, 430px);
}
.project-history-panel {
  margin-top: 14px;
}
.history-list {
  display: grid;
  gap: 10px;
  max-height: 440px;
  overflow: auto;
  padding-right: 4px;
}
.history-card {
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fbfdff;
}
.history-card-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}
.history-card-head strong {
  color: #22303a;
}
.history-card-head em {
  border-radius: 999px;
  padding: 2px 8px;
  color: #fff;
  background: #59636f;
  font-size: 11px;
  font-style: normal;
  white-space: nowrap;
}
.history-card ul {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #34424c;
  line-height: 1.5;
  font-size: 13px;
}
.history-card li + li {
  margin-top: 3px;
}
.history-empty, .history-more {
  border: 1px dashed #cbd5df;
  border-radius: 8px;
  padding: 11px 12px;
  color: #718096;
  background: #f8fafc;
  font-size: 13px;
}
.history-more {
  margin-top: 10px;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(cssPath, css);
fs.writeFileSync(typesPath, types);
