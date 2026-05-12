import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const typesPath = new URL('../src/types.ts', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let types = fs.readFileSync(typesPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

if (!types.includes('LastLoginAt?: string;')) {
  types = types.replace(
    '  IsActive: string;\n};',
    '  IsActive: string;\n  LastLoginAt?: string;\n  LastActiveAt?: string;\n  LoginCount?: string;\n};'
  );
}

app = app.replace(
  /<div className="tr th user-grid">[\s\S]*?<span>Email<\/span><\/div>\s*\{data\.users\.map\(\(user\) => <div className="tr user-grid" key=\{user\.Email\}>[\s\S]*?<\/div>\)\}/,
  `<div className="tr th user-grid"><span>帳號</span><span>姓名</span><span>角色</span><span>Email</span><span>最後登入</span><span>最後活動</span><span>登入次數</span></div>
        {data.users.map((user) => <div className="tr user-grid" key={user.Email}><span>{user.Account || '-'}</span><span>{user.DisplayName}</span><span>{user.Role}</span><span>{user.Email}</span><span>{user.LastLoginAt || '-'}</span><span>{user.LastActiveAt || '-'}</span><span>{user.LoginCount || '0'}</span></div>)}`
);

styles = styles.replace(
  /\.user-grid \{ grid-template-columns: [^;]+; \}/,
  '.user-grid { grid-template-columns: 0.8fr 0.9fr 0.8fr minmax(220px, 1.5fr) 140px 140px 80px; min-width: 1040px; }'
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(typesPath, types);
fs.writeFileSync(stylesPath, styles);
