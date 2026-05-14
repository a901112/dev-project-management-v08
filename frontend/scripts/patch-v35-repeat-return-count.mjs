import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const typesPath = new URL('../src/types.ts', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let types = fs.readFileSync(typesPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

types = replaceOnce(
  types,
  `  CreatedAt: string;
  UpdatedAt: string;
};`,
  `  CreatedAt: string;
  UpdatedAt: string;
  ReturnCount?: string;
};`
);

app = replaceOnce(
  app,
  `              {task.TaskStatus === STATUS_RETURNED && task.ResultReason && <span className="return-reason">退回原因：{task.ResultReason}</span>}
            </div>`,
  `              {task.TaskStatus === STATUS_RETURNED && task.ResultReason && <span className="return-reason">退回原因：{task.ResultReason}</span>}
              {Number(task.ReturnCount || 0) >= 2 && <span className="repeat-return">反覆退回：{task.ReturnCount} 次</span>}
            </div>`
);

if (!styles.includes('.task-fields .repeat-return')) {
  styles = replaceOnce(
    styles,
    `.task-fields .return-reason {
  flex-basis: 100%;
  border-left: 4px solid #a35f00;
  border-radius: 6px;
  padding: 8px 10px;
  color: #7a4200;
  background: #fff7e6;
  font-weight: 700;
}`,
    `.task-fields .return-reason {
  flex-basis: 100%;
  border-left: 4px solid #a35f00;
  border-radius: 6px;
  padding: 8px 10px;
  color: #7a4200;
  background: #fff7e6;
  font-weight: 700;
}
.task-fields .repeat-return {
  border-radius: 999px;
  padding: 5px 10px;
  color: #fff;
  background: #a23b3b;
  font-weight: 800;
}`
  );
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(typesPath, types);
fs.writeFileSync(stylesPath, styles);
