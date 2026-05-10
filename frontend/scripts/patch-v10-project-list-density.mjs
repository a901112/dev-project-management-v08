import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceAll(source, from, to) {
  return source.split(from).join(to);
}

app = replaceAll(
  app,
  `<span>專案代碼</span><span>專案名稱 / 專案品項</span><span>客戶</span><span>開案日</span><span>負責人</span><span>進度</span><span>專案健康度</span><span>任務</span><span>訂單層</span><span>操作</span>`,
  `<span>專案代碼</span><span>專案名稱 / 專案品項</span><span>客戶</span><span>開案 / 預計</span><span>負責人</span><span>進度</span><span>專案健康度</span><span>任務</span><span>訂單層</span><span>操作</span>`
);

app = replaceAll(
  app,
  `<span>{projectOpenDate || '-'}</span>`,
  `<span>{projectOpenDate || '-'}<small>預計 {plannedCloseDate || '-'}</small></span>`
);

app = replaceAll(
  app,
  `<span><Status status={project.Stage || '-'} /><small>預計結案：{plannedCloseDate || '-'}</small></span>`,
  `<span><Status status={project.Stage || '-'} /></span>`
);

app = replaceAll(app, `<small className="health-copy">{health.description}</small>`, ``);
app = replaceAll(
  app,
  `<span className={orderLines.length ? '' : 'order-placeholder'}>{orderLines.length ? \`未結案 \${orderLines.length} 筆\` : '無未結案訂單'}<small>依專案品項比對訂單品號</small></span>`,
  `<span className={orderLines.length ? '' : 'order-placeholder'}>{orderLines.length ? \`未結案 \${orderLines.length} 筆\` : '無未結案訂單'}</span>`
);

styles = replaceAll(
  styles,
  `.project-list-grid { grid-template-columns: 132px minmax(260px, 1.1fr) 96px 112px 112px 100px minmax(250px, 1fr) 104px 138px 120px; min-width: 1360px; }`,
  `.project-list-grid { grid-template-columns: 160px minmax(280px, 1.1fr) 78px 116px 76px 74px 150px 92px 104px 148px; min-width: 1300px; }`
);

styles += `

/* Project list density pass */
.project-panel .tr.project-list-grid:not(.th) { min-height: 72px; }
.project-panel .tr.project-list-grid > span { padding: 10px 9px; }
.project-panel .tr.project-list-grid.th > span:nth-child(4)::before { content: "開案 / 預計"; }
.project-panel .tr.project-list-grid:not(.th) > span:nth-child(10) { flex-wrap: nowrap; }
.project-panel .health-copy { display: none; }
.project-panel .health-title strong { font-size: 13px; line-height: 1.35; }
.project-panel .project-name-button { font-size: 14px; }
.project-panel .link-button { font-size: 13px; }
.project-panel .status,
.project-panel .health-badge { padding: 3px 8px; font-size: 12px; }
`;

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
