import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  /<span className=\{orderLines\.length \? '' : 'order-placeholder'\}>\{orderLines\.length \? `[^`]*\$\{orderLines\.length\}[^`]*` : '[^']*'\}<\/span>/,
  "<span className={orderLines.length ? '' : 'order-placeholder'}>{orderLines.length ? `訂單 ${orderLines.length} 筆` : '無訂單'}</span>"
);

app = app.replace(
  /<span>\{order\.OrderType\}-\{order\.OrderNo\}<small>[^<]*\{order\.Sequence \|\| '-'\}[^<]*<\/small><\/span>/,
  "<span>{order.OrderType}-{order.OrderNo}<small>序號 {order.Sequence || '-'}</small><small>{orderStatusLabel(order)}</small></span>"
);

app = app.replace(
  /<div className="empty">\{items\.length \? '[^']*2203 \/ 2204 \/ 2205[^']*' : '[^']*'\}<\/div>/,
  "<div className=\"empty\">{items.length ? '目前沒有依專案品項與開案日期比對到 2203 / 2204 / 2205 訂單。' : '此專案尚未加入品號，無法查詢訂單層。'}</div>"
);

app = app.replace(
  /function projectOrderLines\(project: Project, orderLines: ErpOrderLine\[\]\) \{[\s\S]*?function uniqueCustomerCodes/,
  `function projectOrderLines(project: Project, orderLines: ErpOrderLine[]) {
  const itemCodes = splitItemCodes(project.ItemCodes).map((item) => normalizeMatchText(item));
  if (itemCodes.length === 0) return [];
  const projectDate = projectDateFloor(project);
  return orderLines
    .filter((order) => isProjectOrder(order, projectDate) && itemCodes.some((itemCode) => normalizeMatchText(order.ItemNo).includes(itemCode)))
    .sort((a, b) => String(orderDateValue(a, 'DueDate') || '').localeCompare(String(orderDateValue(b, 'DueDate') || '')) || String(a.OrderNo || '').localeCompare(String(b.OrderNo || '')));
}

function uniqueCustomerCodes`
);

if (!app.includes('function projectDateFloor')) {
  app = app.replace(
    /function isVisibleOpenOrder\(order: ErpOrderLine\) \{[\s\S]*?\n\}/,
    `function projectDateFloor(project: Project) {
  const codeDate = String(project.ProjectCode || '').match(/DEV-(\\d{8})-/)?.[1] || '';
  return formatDateOnly(codeDate || project.CreatedAt || '');
}

function isProjectOrder(order: ErpOrderLine, projectDate: string) {
  const orderType = String(order.OrderType || '').trim();
  if (!['2203', '2204', '2205'].includes(orderType)) return false;
  const orderDate = formatDateOnly(orderDateValue(order, 'OrderDate'));
  return !projectDate || !orderDate || orderDate >= projectDate;
}

function isOrderClosed(order: ErpOrderLine) {
  const closeCode = String(order.CloseCode || '').trim();
  return ['Y', 'y', '結案', '已結案'].includes(closeCode);
}

function orderStatusLabel(order: ErpOrderLine) {
  return isOrderClosed(order) ? '已結案' : '未結案';
}`
  );
}

fs.writeFileSync(appPath, app);
