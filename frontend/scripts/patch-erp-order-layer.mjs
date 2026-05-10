import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

if (!app.includes('ErpOrderLine')) {
  app = app.replace(
    "import type { AppData, Project, Task, User } from './types';",
    "import type { AppData, ErpOrderLine, Project, Task, User } from './types';"
  );
}

app = app.replace(
`    const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
    const overdueTasks = openTasks.filter((task) => isOverdue(task));
    return { project, tasks, health, plannedCloseDate, openTasks, overdueTasks };`,
`    const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
    const overdueTasks = openTasks.filter((task) => isOverdue(task));
    const orderLines = projectOrderLines(project, data.erpOrderLines || []);
    return { project, tasks, health, plannedCloseDate, openTasks, overdueTasks, orderLines };`
);

app = app.replace(
`        {filteredRows.map(({ project, tasks, health, plannedCloseDate, openTasks, overdueTasks }) => (`,
`        {filteredRows.map(({ project, tasks, health, plannedCloseDate, openTasks, overdueTasks, orderLines }) => (`
);

app = app.replace(
`            <span className="order-placeholder">待串接 ERP<small>訂單 / 客戶 / 出貨狀態</small></span>`,
`            <span className={orderLines.length ? '' : 'order-placeholder'}>{orderLines.length ? \`未結案 \${orderLines.length} 筆\` : '無未結案訂單'}<small>依專案品項比對訂單品號</small></span>`
);

app = app.replace(
`  const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
  const overdueTasks = openTasks.filter((task) => isOverdue(task));
  const items = splitItemCodes(project.ItemCodes);`,
`  const openTasks = tasks.filter((task) => unfinishedStatuses.includes(task.TaskStatus));
  const overdueTasks = openTasks.filter((task) => isOverdue(task));
  const items = splitItemCodes(project.ItemCodes);
  const orderLines = projectOrderLines(project, data.erpOrderLines || []);`
);

app = app.replace(
`          <div className="tr th order-grid"><span>品號</span><span>客戶</span><span>訂單</span><span>訂單數量</span><span>已交數量</span><span>預交日</span><span>細項狀態</span><span>目前說明</span></div>
          {(items.length ? items : ['尚未加入品號']).map((item) => (
            <div className="tr order-grid" key={item}><span>{item}</span><span>待串接</span><span>待串接 ERP</span><span>-</span><span>-</span><span>-</span><span><Status status="待查詢" /></span><span>V0.8 先保留訂單層位置，後續接 COPTC / COPTD 後自動帶出。</span></div>
          ))}`,
`          <div className="tr th order-grid"><span>訂單</span><span>客戶</span><span>品號</span><span>客戶品號</span><span>訂單數量</span><span>已交數量</span><span>未交數量</span><span>預交日</span><span>品名 / 規格</span></div>
          {orderLines.map((order) => (
            <div className="tr order-grid" key={order.OrderKey || \`\${order.OrderType}-\${order.OrderNo}-\${order.Sequence}-\${order.ItemNo}\`}>
              <span>{order.OrderType}-{order.OrderNo}<small>序號 {order.Sequence || '-'}</small></span>
              <span>{order.CustomerCode || '-'}<small>{order.CustomerName || ''}</small></span>
              <span>{order.ItemNo || '-'}</span>
              <span>{order.CustomerItemNo || '-'}</span>
              <span>{order.OrderQty || '0'} {order.Unit || ''}</span>
              <span>{order.DeliveredQty || '0'}</span>
              <span>{order.UnshippedQty || '0'}</span>
              <span>{formatDateOnly(order.DueDate) || '-'}</span>
              <span>{order.ItemName || '-'}<small>{order.Spec || ''}</small></span>
            </div>
          ))}
          {orderLines.length === 0 && (
            <div className="empty">{items.length ? '目前沒有依專案品項比對到 2203 / 2204 / 2205 未結案訂單。' : '此專案尚未加入品號，無法查詢訂單層。'}</div>
          )}`
);

if (!app.includes('function projectOrderLines')) {
  app = app.replace(
`function matchProjectFilters(row: { project: Project; health: ProjectHealth }, filters: ProjectFiltersState, data: AppData) {`,
`function projectOrderLines(project: Project, orderLines: ErpOrderLine[]) {
  const itemCodes = splitItemCodes(project.ItemCodes).map((item) => normalizeMatchText(item));
  if (itemCodes.length === 0) return [];
  return orderLines
    .filter((order) => isVisibleOpenOrder(order) && itemCodes.some((itemCode) => normalizeMatchText(order.ItemNo).includes(itemCode)))
    .sort((a, b) => String(a.DueDate || '').localeCompare(String(b.DueDate || '')) || String(a.OrderNo || '').localeCompare(String(b.OrderNo || '')));
}

function normalizeMatchText(value: string) {
  return String(value || '').trim().toUpperCase();
}

function isVisibleOpenOrder(order: ErpOrderLine) {
  const orderType = String(order.OrderType || '').trim();
  const closeCode = String(order.CloseCode || '').trim();
  return ['2203', '2204', '2205'].includes(orderType) && !['Y', 'y', '結案', '已結案'].includes(closeCode);
}

function matchProjectFilters(row: { project: Project; health: ProjectHealth }, filters: ProjectFiltersState, data: AppData) {`
  );
}

app = app.replace(
`function parseDateOnly(value: string) {
  const normalized = String(value || '').trim().replace(/\//g, '-').slice(0, 10);
  if (!normalized) return null;
  const date = new Date(normalized);`,
`function parseDateOnly(value: string) {
  const normalized = String(value || '').trim().replace(/\//g, '-').slice(0, 10);
  if (!normalized) return null;
  if (/^\d{8}$/.test(normalized)) {
    const date = new Date(\`\${normalized.slice(0, 4)}-\${normalized.slice(4, 6)}-\${normalized.slice(6, 8)}\`);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }
  const date = new Date(normalized);`
);

styles = styles.replace(
  '.order-grid { grid-template-columns: 110px 120px 140px 95px 95px 110px 120px minmax(250px, 1fr); min-width: 1040px; }',
  '.order-grid { grid-template-columns: 130px 150px 130px 120px 100px 95px 95px 110px minmax(250px, 1fr); min-width: 1180px; }'
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
