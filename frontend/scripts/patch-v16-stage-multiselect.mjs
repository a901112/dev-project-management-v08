import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function r(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

app = r(app, '  stage: string;', '  stages: string[];');
app = r(app, "const emptyProjectFilters: ProjectFiltersState = { keyword: '', status: '', stage: '', health: '', owner: '' };", "const emptyProjectFilters: ProjectFiltersState = { keyword: '', status: '', stages: [], health: '', owner: '' };");
app = r(app, `  function update(key: keyof ProjectFiltersState, value: string) {
    setFilters({ ...filters, [key]: value });
  }
  return (`, `  function update(key: keyof ProjectFiltersState, value: string) {
    setFilters({ ...filters, [key]: value });
  }
  function toggleStage(stage: string) {
    const stages = filters.stages.includes(stage)
      ? filters.stages.filter((item) => item !== stage)
      : [...filters.stages, stage];
    setFilters({ ...filters, stages });
  }
  return (`);
app = r(app, `<label>主階段<select value={filters.stage} onChange={(event) => update('stage', event.target.value)}><option value="">全部</option>{projectStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>`, `<div className="stage-filter-group"><span>主階段</span><div>{projectStages.map((stage) => <button key={stage} type="button" className={filters.stages.includes(stage) ? 'active' : ''} onClick={() => toggleStage(stage)}>{stage.replace('中', '')}</button>)}</div></div>`);
app = r(app, `if (filters.stage && row.project.Stage !== filters.stage) return false;`, `if (filters.stages.length > 0 && !filters.stages.includes(row.project.Stage)) return false;`);

styles = r(styles, `.project-filter-panel { grid-template-columns: 1.5fr repeat(4, minmax(120px, 1fr)) auto; align-items: end; }`, `.project-filter-panel { grid-template-columns: 1.35fr minmax(150px, 0.7fr) minmax(360px, 1.8fr) minmax(120px, 0.75fr) minmax(120px, 0.75fr) auto; align-items: end; }`);
if (!styles.includes('.stage-filter-group')) {
  styles += `

.stage-filter-group {
  display: grid;
  gap: 6px;
  color: #52616b;
  font-size: 13px;
  font-weight: 700;
}
.stage-filter-group > div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
  align-items: center;
}
.stage-filter-group button {
  min-height: 30px;
  border: 1px solid #cbd5df;
  border-radius: 999px;
  padding: 4px 10px;
  color: #52616b;
  background: #fff;
  font-size: 12px;
  font-weight: 800;
}
.stage-filter-group button.active {
  border-color: #245b74;
  color: #fff;
  background: #245b74;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
