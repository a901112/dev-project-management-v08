import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v45 marker not found: ${label}`);
  return source.replace(from, to);
}

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

app = replaceOnce(
  app,
  `import { Bell, CheckCircle2, ClipboardList, Eye, FolderKanban, LogOut, MessageSquareText, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';`,
  `import { Bell, CheckCircle2, ClipboardList, Eye, FileText, FolderKanban, LogOut, MessageSquareText, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';`
);

app = replaceOnce(
  app,
  `type View = 'dashboard' | 'projects' | 'projectDetail' | 'allTasks' | 'myTasks' | 'review' | 'audit' | 'users';`,
  `type View = 'dashboard' | 'projects' | 'projectDetail' | 'allTasks' | 'myTasks' | 'review' | 'audit' | 'dailyReports' | 'users';`
);

if (!app.includes(`{ view: 'dailyReports'`)) {
  app = replaceRequired(
    app,
    `  { view: 'audit', label: '異常判讀', icon: Search },
  { view: 'users', label: '人員設定', icon: ShieldCheck }
`,
    `  { view: 'audit', label: '異常判讀', icon: Search },
  { view: 'dailyReports', label: '每日工作日報', icon: FileText },
  { view: 'users', label: '人員設定', icon: ShieldCheck }
`,
    'daily report nav item'
  );
}

app = replaceOnce(
  app,
  `if (user && view === 'users' && !canViewUsersPage(user)) setView('dashboard');`,
  `if (user && isAdminOnlyView(view) && !canViewUsersPage(user)) setView('dashboard');`
);

if (!app.includes(`{view === 'dailyReports' && canViewUsersPage(user) && <DailyReportsPage data={data} />}`)) {
  app = replaceRequired(
    app,
    `      {view === 'audit' && <Audit data={data} />}
      {view === 'users' && canViewUsersPage(user) && <Users data={data} />}
`,
    `      {view === 'audit' && <Audit data={data} />}
      {view === 'dailyReports' && canViewUsersPage(user) && <DailyReportsPage data={data} />}
      {view === 'users' && canViewUsersPage(user) && <Users data={data} />}
`,
    'daily report route'
  );
}

app = replaceOnce(
  app,
  `const visibleNavItems = navItems.filter((item) => item.view !== 'users' || canViewUsersPage(user));`,
  `const visibleNavItems = navItems.filter((item) => !isAdminOnlyView(item.view) || canViewUsersPage(user));`
);

if (!app.includes('function isAdminOnlyView(')) {
  app = replaceRequired(
    app,
    `function canViewUsersPage(user: User) {
`,
    `function isAdminOnlyView(view: View) {
  return view === 'users' || view === 'dailyReports';
}

function canViewUsersPage(user: User) {
`,
    'admin view helper'
  );
}

const pageComponent = String.raw`
type DailyReportRow = Record<string, string>;

function DailyReportsPage({ data }: { data: AppData }) {
  const ext = data as AppData & { dailyReports?: DailyReportRow[]; dailyReportItems?: DailyReportRow[]; nonTaskWorkLogs?: DailyReportRow[] };
  const reports = ext.dailyReports || [];
  const items = ext.dailyReportItems || [];
  const nonTaskLogs = ext.nonTaskWorkLogs || [];
  const dates = useMemo(() => Array.from(new Set(reports.map((report) => report.ReportDate).filter(Boolean))).sort((a, b) => String(b).localeCompare(String(a))), [reports]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const activeDate = selectedDate || dates[0] || formatLocalDate(new Date());

  useEffect(() => {
    if (!selectedDate && dates[0]) setSelectedDate(dates[0]);
  }, [dates, selectedDate]);

  const people = dailyReportPeople(data, reports);
  const visibleReports = reports
    .filter((report) => normalizeReportDate(report.ReportDate) === normalizeReportDate(activeDate))
    .filter((report) => !selectedPerson || sameEmail(report.PersonEmail, selectedPerson));
  const visibleReportIds = new Set(visibleReports.map((report) => report.ReportId));
  const visibleItems = items.filter((item) => visibleReportIds.has(item.ReportId));
  const visibleNonTaskLogs = nonTaskLogs
    .filter((log) => normalizeReportDate(log.WorkDate) === normalizeReportDate(activeDate))
    .filter((log) => !selectedPerson || sameEmail(log.PersonEmail, selectedPerson));
  const actionCount = visibleItems.filter((item) => truthySheetValue(item.ActionRequired)).length;
  const gapCount = visibleItems.filter((item) => item.SectionType === 'system_gap').length;

  return (
    <section className="content daily-report-page">
      <div className="section-heading"><div><h2>每日工作日報</h2><p className="page-subtitle">主管檢視用，先依人員與日期完整展示 AI 草稿，不打散到個人頁。</p></div></div>
      <div className="filter-panel daily-report-filter-panel">
        <label>日報日期<select value={activeDate} onChange={(event) => setSelectedDate(event.target.value)}>{dates.length === 0 && <option value={activeDate}>{activeDate}</option>}{dates.map((date) => <option key={date} value={date}>{date}</option>)}</select></label>
        <label>人員<select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}><option value="">全部人員</option>{people.map((person) => <option key={person.email} value={person.email}>{person.name}</option>)}</select></label>
      </div>
      <div className="metric-grid daily-report-metrics">
        <Metric label="日報份數" value={visibleReports.length} />
        <Metric label="日報細項" value={visibleItems.length} />
        <Metric label="待處理事項" value={actionCount} tone={actionCount ? 'warn' : ''} />
        <Metric label="系統缺口" value={gapCount} tone={gapCount ? 'bad' : ''} />
      </div>
      {reports.length === 0 && <div className="empty-card">目前前台尚未收到 DailyReports / DailyReportItems 資料。請確認 Apps Script 已重新部署，並且 getAppData 有回傳日報分頁。</div>}
      {reports.length > 0 && visibleReports.length === 0 && <div className="empty-card">這個日期與人員條件下沒有日報草稿。</div>}
      <div className="daily-report-list">
        {visibleReports.map((report) => {
          const reportItems = visibleItems.filter((item) => item.ReportId === report.ReportId).sort((a, b) => Number(a.SortOrder || 0) - Number(b.SortOrder || 0));
          return <DailyReportCard key={report.ReportId} data={data} report={report} items={reportItems} />;
        })}
      </div>
      <NonTaskWorkLogSection data={data} logs={visibleNonTaskLogs} />
    </section>
  );
}

function DailyReportCard({ data, report, items }: { data: AppData; report: DailyReportRow; items: DailyReportRow[] }) {
  const sections = dailyReportSections(items);
  return (
    <article className="daily-report-card">
      <div className="daily-report-card-head"><div><strong>{report.PersonName || displayUser(data, report.PersonEmail)}</strong><span>{report.PersonEmail || '-'}</span></div><div className="daily-report-meta"><span>{report.Status || 'AI草稿'}</span><span>回顧 {report.TargetDate || report.ReportDate}</span></div></div>
      {report.Summary && <p className="daily-report-summary">{report.Summary}</p>}
      {sections.map((section) => <section className="daily-report-section" key={section.type}><div className="daily-report-section-title"><strong>{dailyReportSectionLabel(section.type)}</strong><span>{section.items.length}</span></div><div>{section.items.map((item) => <DailyReportItemRow key={item.ItemId} item={item} />)}</div></section>)}
      {items.length === 0 && <div className="daily-report-empty">這份日報尚無細項。</div>}
    </article>
  );
}

function DailyReportItemRow({ item }: { item: DailyReportRow }) {
  const title = [item.ItemNo, item.ItemNameShort].filter(Boolean).join(' / ') || item.TaskCode || '未命名事項';
  return <article className={'daily-report-item-row ' + (truthySheetValue(item.ActionRequired) ? 'needs-action' : '')}><div><div className="daily-report-item-title"><strong>{title}</strong>{truthySheetValue(item.ActionRequired) && <em className="status review">待處理</em>}</div><p>{item.UserContent || item.AIContent || '-'}</p><div className="daily-report-item-tags">{item.ReviewStatus && <span>{item.ReviewStatus}</span>}{item.TaskCode && <span>{item.TaskCode}</span>}{item.ProjectCode && <span>{item.ProjectCode}</span>}{item.SourceType && <span>來源：{item.SourceType}</span>}{item.Confidence && <span>信心：{item.Confidence}</span>}</div></div><div className="daily-report-item-side"><span>{dailyReportSectionLabel(item.SectionType)}</span>{item.UpdatedAt && <small>{item.UpdatedAt}</small>}</div></article>;
}

function NonTaskWorkLogSection({ data, logs }: { data: AppData; logs: DailyReportRow[] }) {
  return <section className="daily-report-non-task"><div className="section-heading in-panel"><h3><ClipboardList size={18} />非任務工作回報</h3><span className="muted">{logs.length} 筆</span></div>{logs.length === 0 ? <div className="daily-report-empty">這一天沒有非任務工作回報。若人員有支援、樣檢協助、臨時交辦或廠內協調，未來應在這裡登錄。</div> : <div className="daily-report-non-task-list">{logs.map((log) => <article className="daily-report-item-row" key={log.NonTaskWorkLogId}><div><div className="daily-report-item-title"><strong>{[log.RelatedItemNo, log.RelatedItemNameShort].filter(Boolean).join(' / ') || log.WorkType || '非任務工作'}</strong>{truthySheetValue(log.HasFollowUp) && <em className="status review">需追蹤</em>}</div><p>{log.Content || '-'}</p><div className="daily-report-item-tags"><span>{displayUser(data, log.PersonEmail)}</span>{log.FollowUpDate && <span>追蹤日：{log.FollowUpDate}</span>}{log.ReviewStatus && <span>{log.ReviewStatus}</span>}{log.ConvertedTaskId && <span>已轉任務：{log.ConvertedTaskId}</span>}</div></div></article>)}</div>}</section>;
}

function dailyReportPeople(data: AppData, reports: DailyReportRow[]) {
  const people = new Map<string, string>();
  reports.forEach((report) => { const email = String(report.PersonEmail || '').trim(); if (email) people.set(email.toLowerCase(), (report.PersonName || displayUser(data, email)) + ' / ' + email); });
  return Array.from(people.entries()).map(([email, name]) => ({ email, name })).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
}

function dailyReportSections(items: DailyReportRow[]) {
  const order = ['yesterday_progress', 'today_attention', 'manager_decision', 'system_gap', 'non_task', 'after_8_update'];
  const groups = new Map<string, DailyReportRow[]>();
  items.forEach((item) => { const type = item.SectionType || 'other'; groups.set(type, [...(groups.get(type) || []), item]); });
  return Array.from(groups.entries()).map(([type, sectionItems]) => ({ type, items: sectionItems })).sort((a, b) => (order.includes(a.type) ? order.indexOf(a.type) : order.length) - (order.includes(b.type) ? order.indexOf(b.type) : order.length));
}

function dailyReportSectionLabel(type: string) {
  const labels: Record<string, string> = { yesterday_progress: '昨日人員進度', today_attention: '今日應注意', manager_decision: '需要主管決定', system_gap: '系統缺口', non_task: '非任務工作', after_8_update: '8點後補登', progress: '昨日人員進度', followUp: '今日應注意', missing: '待補歷程', support: '支援與樣檢' };
  return labels[type] || type || '其他';
}

function normalizeReportDate(value: string) { const parsed = parseLocalDate(value); return parsed ? formatLocalDate(parsed) : String(value || '').slice(0, 10); }
function truthySheetValue(value: string) { return ['true', 'yes', 'y', '1', '是'].includes(String(value || '').trim().toLowerCase()); }
`;

if (!app.includes('function DailyReportsPage(')) app = replaceRequired(app, `function Users({ data }: { data: AppData }) {`, `${pageComponent}\nfunction Users({ data }: { data: AppData }) {`, 'daily report page component');

const pageStyles = String.raw`
.page-subtitle { margin: 5px 0 0; color: #52616b; font-size: 13px; }
.daily-report-page { display: grid; gap: 14px; }
.daily-report-filter-panel { grid-template-columns: minmax(180px, 260px) minmax(260px, 420px); align-items: end; }
.daily-report-metrics { margin-bottom: 0; }
.daily-report-list { display: grid; gap: 14px; }
.daily-report-card, .daily-report-non-task { border: 1px solid #d9e2e7; border-radius: 8px; background: #fff; }
.daily-report-card { overflow: hidden; }
.daily-report-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #edf2f7; background: #f8fafc; }
.daily-report-card-head strong { display: block; font-size: 17px; }
.daily-report-card-head span, .daily-report-meta span { display: block; color: #52616b; font-size: 13px; }
.daily-report-meta { display: grid; gap: 4px; min-width: 160px; text-align: right; }
.daily-report-summary { margin: 0; padding: 13px 16px; border-bottom: 1px solid #edf2f7; color: #34495e; line-height: 1.5; }
.daily-report-section { display: grid; grid-template-columns: 180px minmax(0, 1fr); border-top: 1px solid #edf2f7; }
.daily-report-section-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding: 13px 14px; background: #fbfdff; }
.daily-report-section-title span { display: inline-flex; min-width: 24px; min-height: 22px; align-items: center; justify-content: center; border-radius: 999px; color: #fff; background: #59636f; font-size: 12px; font-weight: 800; }
.daily-report-item-row { display: grid; grid-template-columns: minmax(0, 1fr) 150px; gap: 12px; padding: 13px 14px; border-left: 4px solid transparent; border-top: 1px solid #edf2f7; background: #fff; }
.daily-report-item-row.needs-action { border-left-color: #a35f00; background: #fffdf7; }
.daily-report-item-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.daily-report-item-row p { margin: 7px 0; color: #34495e; line-height: 1.5; }
.daily-report-item-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.daily-report-item-tags span { border-radius: 999px; padding: 3px 8px; color: #52616b; background: #edf2f7; font-size: 12px; font-weight: 700; }
.daily-report-item-side { display: grid; gap: 6px; align-content: start; color: #52616b; text-align: right; font-size: 13px; font-weight: 800; }
.daily-report-empty { margin: 0; padding: 14px; color: #718096; background: #fff; line-height: 1.5; }
.daily-report-non-task { padding: 14px; }
.daily-report-non-task .daily-report-item-row { border: 1px solid #edf2f7; border-radius: 8px; }
`;

if (!styles.includes('.daily-report-page')) styles = replaceRequired(styles, `\n@media (max-width: 1180px) {`, `${pageStyles}\n@media (max-width: 1180px) {`, 'daily report styles');
styles = replaceOnce(styles, `.metric-grid, .project-summary-grid, .task-filter-panel, .my-task-filter-panel, .project-filter-panel, .help-grid, .field-grid, .field-grid.compact, .project-form-grid, .daily-brief-grid { grid-template-columns: 1fr; }`, `.metric-grid, .project-summary-grid, .task-filter-panel, .my-task-filter-panel, .project-filter-panel, .daily-report-filter-panel, .help-grid, .field-grid, .field-grid.compact, .project-form-grid, .daily-brief-grid { grid-template-columns: 1fr; }`);
if (!styles.includes('.daily-report-card-head, .daily-report-section, .daily-report-item-row { grid-template-columns: 1fr; }')) {
  styles = replaceRequired(styles, `  .daily-brief-head, .daily-brief-item { grid-template-columns: 1fr; }
`, `  .daily-brief-head, .daily-brief-item { grid-template-columns: 1fr; }
  .daily-report-card-head, .daily-report-section, .daily-report-item-row { grid-template-columns: 1fr; }
  .daily-report-meta, .daily-report-item-side { text-align: left; }
`, 'daily report mobile styles');
}

fs.writeFileSync(appPath, app, 'utf8');
fs.writeFileSync(stylesPath, styles, 'utf8');
