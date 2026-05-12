import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

app = app.replace(
  /<div className="tr th order-grid">[\s\S]*?<span>品名 \/ 規格<\/span><\/div>/,
  '<div className="tr th order-grid"><span>結案碼</span><span>訂單</span><span>客戶</span><span>品號</span><span>客戶品號</span><span>訂單數量</span><span>已交數量</span><span>未交數量</span><span>預交日</span><span>品名 / 規格</span></div>'
);

app = app.replace(
  /<span>\{order\.OrderType\}-\{order\.OrderNo\}<small>[^<]*\{order\.Sequence \|\| '-'\}[^<]*<\/small>(?:<small>\{orderStatusLabel\(order\)\}<\/small>)?<\/span>\s*<span>\{order\.CustomerCode \|\| '-'\}(?:<small>\{order\.CustomerName \|\| ''\}<\/small>)?<\/span>/,
  "<span><em className={`order-close-code ${isOrderClosed(order) ? 'closed' : 'open'}`}>{order.CloseCode || '-'}</em><small>{orderStatusLabel(order)}</small></span>\n              <span>{order.OrderType}-{order.OrderNo}</span>\n              <span>{order.CustomerCode || '-'}</span>"
);

styles = styles.replace(
  /\.order-grid \{ grid-template-columns: [^;]+; min-width: [^;]+; \}/,
  '.order-grid { grid-template-columns: 74px 128px 82px 126px 116px 96px 90px 90px 104px minmax(240px, 1fr); min-width: 1240px; }'
);

if (!styles.includes('.order-close-code')) {
  styles += `

.order-close-code {
  display: inline-flex;
  min-width: 28px;
  min-height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 8px;
  background: #e6eef4;
  color: #34495e;
  font-style: normal;
  font-weight: 800;
}
.order-close-code.closed {
  background: #5b6573;
  color: #fff;
}
.order-close-code.open {
  background: #1f7a4d;
  color: #fff;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
