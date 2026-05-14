import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceOnce(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

app = replaceOnce(
  app,
  `              <span>回報結果：{task.TaskResult}{task.ResultReason ? \` / \${task.ResultReason}\` : ''}</span>
            </div>`,
  `              <span>回報結果：{task.TaskResult}{task.ResultReason ? \` / \${task.ResultReason}\` : ''}</span>
              {task.TaskStatus === STATUS_RETURNED && task.ResultReason && <span className="return-reason">退回原因：{task.ResultReason}</span>}
            </div>`
);

app = replaceOnce(
  app,
  `          {(modal.type === 'result' || modal.type === 'review') && <label>備註<textarea name="Comment" required /></label>}`,
  `          {modal.type === 'review' && modal.action === 'return' && <label>退回原因<textarea name="ResultReason" required /></label>}
          {modal.type === 'review' && modal.action !== 'return' && <label>備註<textarea name="Comment" required /></label>}
          {modal.type === 'result' && <label>備註<textarea name="Comment" required /></label>}`
);

if (!styles.includes('.task-fields .return-reason')) {
  styles = replaceOnce(
    styles,
    `.task-fields { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 9px; }`,
    `.task-fields { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 9px; }
.task-fields .return-reason {
  flex-basis: 100%;
  border-left: 4px solid #a35f00;
  border-radius: 6px;
  padding: 8px 10px;
  color: #7a4200;
  background: #fff7e6;
  font-weight: 700;
}`
  );
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
