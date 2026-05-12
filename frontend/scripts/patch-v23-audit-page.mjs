import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const cssPath = new URL('../src/styles.css', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

if (!app.includes("| 'audit'")) {
  app = app.replace(
    "type View = 'dashboard' | 'projects' | 'projectDetail' | 'allTasks' | 'myTasks' | 'review' | 'users';",
    "type View = 'dashboard' | 'projects' | 'projectDetail' | 'allTasks' | 'myTasks' | 'review' | 'audit' | 'users';"
  );
}

if (!app.includes("view: 'audit'")) {
  app = app.replace(
    "{ view: 'review', label: '待覆判', icon: ShieldCheck },",
    "{ view: 'review', label: '待覆判', icon: ShieldCheck },\n  { view: 'audit', label: '異常判讀', icon: Search },"
  );
}

if (!app.includes("view === 'audit'")) {
  app = app.replace(
    "      {view === 'users' && canViewUsersPage(user) && <Users data={data} />}",
    "      {view === 'audit' && <Audit data={data} />}\n      {view === 'users' && canViewUsersPage(user) && <Users data={data} />}"
  );
}

if (!app.includes('function Audit(')) {
  app = app.replace(
    "function Users({ data }: { data: AppData }) {",
    `function Audit({ data }: { data: AppData }) {
  const [keyword, setKeyword] = useState('');
  const allIssues = useMemo(() => missingProjectOrderIssues(data), [data]);
  const filteredIssues = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return allIssues;
    return allIssues.filter(({ order }) => [
      order.OrderType,
      order.OrderNo,
      order.OrderDate,
      order.CustomerCode,
      order.ItemNo,
      order.CustomerItemNo,
      order.ItemName,
      order.Spec,
      order.DueDate,
      order.CloseCode
    ].some((value) => String(value || '').toLowerCase().includes(text)));
  }, [allIssues, keyword]);
  const visibleIssues = filteredIssues.slice(0, 200);
  const orderCount = new Set(allIssues.map(({ order }) => order.OrderKey || String(order.OrderType || '') + '-' + String(order.OrderNo || ''))).size;
  const itemCount = new Set(allIssues.map(({ order }) => normalizeMatchText(order.ItemNo)).filter(Boolean)).size;

  return (
    <section className="content">
      <div className="section-heading">
        <div>
          <h2>異常判讀</h2>
          <p className="muted">第一版先檢查 2203 / 2204、確認碼 Y、狀態碼 N 的訂單是否尚未建立對應的開發專案。</p>
        </div>
      </div>
      <div className="metric-grid">
        <Metric label="異常明細" value={allIssues.length} tone={allIssues.length ? 'bad' : ''} />
        <Metric label="影響訂單" value={orderCount} tone={orderCount ? 'warn' : ''} />
        <Metric label="影響品號" value={itemCount} />
        <Metric label="檢查範圍" value="2203/2204 + Y/N" />
      </div>
      <div className="panel audit-filter-panel">
        <label>關鍵字<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="訂單 / 客戶 / 品號 / 品名" /></label>
        <div className="audit-rule-note">確認碼 Y，狀態碼 N</div>
      </div>
      <div className="panel">
        <div className="audit-summary">
          <strong>未建立專案的訂單明細</strong>
          <span>共 {filteredIssues.length} 筆，畫面先顯示前 {visibleIssues.length} 筆</span>
        </div>
        <div className="table audit-table">
          <div className="tr th audit-grid">
            <span>問題</span><span>訂單</span><span>訂單日</span><span>客戶</span><span>品號</span><span>客戶品號</span><span>預交日</span><span>品名</span><span>數量</span><span>建議</span>
          </div>
          {visibleIssues.map(({ order }) => (
            <div className="tr audit-grid" key={order.OrderKey || String(order.OrderType || '') + '-' + String(order.OrderNo || '') + '-' + String(order.ItemNo || '')}>
              <span><em className="health-badge danger">未開案</em></span>
              <span><strong>{order.OrderType}-{order.OrderNo}</strong><small>{orderStatusLabel(order)}</small></span>
              <span>{formatDateOnly(orderDateValue(order, 'OrderDate')) || '-'}</span>
              <span>{order.CustomerCode || '-'}</span>
              <span><strong>{order.ItemNo || '-'}</strong></span>
              <span>{order.CustomerItemNo || '-'}</span>
              <span>{formatDateOnly(orderDateValue(order, 'DueDate')) || '-'}</span>
              <span>{order.ItemName || '-'}</span>
              <span><strong>{order.OrderQty || '-'}</strong><small>未交 {order.UnshippedQty || '-'}</small></span>
              <span>確認是否需要新增專案，或把此品號加入既有專案品項。</span>
            </div>
          ))}
          {visibleIssues.length === 0 && <div className="empty-card">目前沒有符合條件的異常。</div>}
        </div>
      </div>
    </section>
  );
}

function missingProjectOrderIssues(data: AppData) {
  return (data.erpOrderLines || [])
    .filter((order) => ['2203', '2204'].includes(String(order.OrderType || '').trim()))
    .filter((order) => String(order.CloseCode || '').trim().toUpperCase() === 'N')
    .filter((order) => !findProjectForOrder(data.projects, order))
    .sort((a, b) =>
      String(orderDateValue(b, 'OrderDate') || '').localeCompare(String(orderDateValue(a, 'OrderDate') || '')) ||
      String(b.OrderNo || '').localeCompare(String(a.OrderNo || ''))
    )
    .map((order) => ({ order }));
}

function findProjectForOrder(projects: Project[], order: ErpOrderLine) {
  const itemNo = normalizeMatchText(order.ItemNo);
  if (!itemNo) return null;
  return projects.find((project) =>
    splitItemCodes(project.ItemCodes)
      .map(normalizeMatchText)
      .filter(Boolean)
      .some((itemCode) => itemNo.includes(itemCode))
  ) || null;
}

function Users({ data }: { data: AppData }) {`
  );
}

if (!css.includes('.audit-filter-panel')) {
  css += `

.audit-filter-panel {
  display: grid;
  grid-template-columns: minmax(280px, 520px) auto;
  align-items: end;
  gap: 14px;
  margin-bottom: 14px;
}
.check-line {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  color: #22303a;
  font-weight: 700;
}
.check-line input {
  width: auto;
}
.audit-rule-note {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: #52616b;
  font-size: 13px;
  font-weight: 800;
}
.audit-summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #52616b;
}
.audit-summary strong {
  color: #22303a;
}
.audit-table {
  overflow-x: auto;
}
.audit-grid {
  grid-template-columns: 92px 135px 96px 76px 120px 120px 96px minmax(260px, 1fr) 92px 220px;
  min-width: 1360px;
}
.audit-grid span {
  min-width: 0;
}
.audit-grid small {
  display: block;
  margin-top: 4px;
  color: #718096;
  line-height: 1.35;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(cssPath, css);
