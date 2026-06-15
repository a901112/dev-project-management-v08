import fs from 'fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceAll(from, to) {
  app = app.split(from).join(to);
}

replaceAll('title="昨日進度"', 'title="前日工作日報"');
replaceAll('empty="昨天沒有可整理的系統進度"', 'empty="回顧區間沒有可整理的系統進度"');
replaceAll('empty="今天沒有到期追蹤"', 'empty="今天到未來 7 天沒有需要注意的任務"');

replaceAll(
  `                {item.task && <button className="light" onClick={() => setModal({ type: 'workLog', task: item.task! })}><MessageSquareText size={14} />補歷程</button>}
                {!item.task && <button className="light" onClick={() => setView('myTasks')}>開啟任務</button>}
`,
  ''
);

replaceAll(
  `  const today = startOfLocalDay(new Date());
  const yesterday = addDays(today, -1);`,
  `  const today = startOfLocalDay(new Date());
  const targetWindow = dailyBriefTargetWindow(today);
  const attentionEnd = addDays(today, 7);`
);

replaceAll(
  `sameLocalDate(log.LogDate, yesterday) || sameLocalDate(log.CreatedAt, yesterday)`,
  `withinLocalDateRange(log.LogDate, targetWindow.start, targetWindow.end) || withinLocalDateRange(log.CreatedAt, targetWindow.start, targetWindow.end)`
);
replaceAll(
  `sameLocalDate(String(item.CreatedAt || ''), yesterday)`,
  `withinLocalDateRange(String(item.CreatedAt || ''), targetWindow.start, targetWindow.end)`
);
replaceAll(
  `sameLocalDate(String(comment.CreatedAt || ''), yesterday)`,
  `withinLocalDateRange(String(comment.CreatedAt || ''), targetWindow.start, targetWindow.end)`
);
replaceAll(
  `onOrBeforeLocalDate(log.NextFollowUpDate, today)`,
  `onOrBeforeLocalDate(log.NextFollowUpDate, attentionEnd)`
);
replaceAll(
  `onOrBeforeLocalDate(task.DueDate, today) || task.TaskStatus === STATUS_RETURNED || task.TaskStatus === STATUS_PENDING`,
  `onOrBeforeLocalDate(task.DueDate, attentionEnd) || task.TaskStatus === STATUS_RETURNED || task.TaskStatus === STATUS_PENDING`
);

replaceAll(
  `const hasYesterdayLog = logs.some((log) => String(log.TaskId || '') === String(task.TaskId) && (sameLocalDate(log.LogDate, yesterday) || sameLocalDate(log.CreatedAt, yesterday)));
      const hasYesterdayTransition = transitions.some((item) => String(item.TaskId || '') === String(task.TaskId) && sameLocalDate(String(item.CreatedAt || ''), yesterday));
      const hasYesterdayComment = comments.some((item) => String(item.TaskId || '') === String(task.TaskId) && sameLocalDate(String(item.CreatedAt || ''), yesterday));
      return !hasYesterdayLog && !hasYesterdayTransition && !hasYesterdayComment`,
  `const hasTargetLog = logs.some((log) => String(log.TaskId || '') === String(task.TaskId) && (withinLocalDateRange(log.LogDate, targetWindow.start, targetWindow.end) || withinLocalDateRange(log.CreatedAt, targetWindow.start, targetWindow.end)));
      const hasTargetTransition = transitions.some((item) => String(item.TaskId || '') === String(task.TaskId) && withinLocalDateRange(String(item.CreatedAt || ''), targetWindow.start, targetWindow.end));
      const hasTargetComment = comments.some((item) => String(item.TaskId || '') === String(task.TaskId) && withinLocalDateRange(String(item.CreatedAt || ''), targetWindow.start, targetWindow.end));
      return !hasTargetLog && !hasTargetTransition && !hasTargetComment`
);

replaceAll(
  `body: '昨天沒有看到此任務的系統歷程，請補進度、下一步或追蹤日期。'`,
  `body: '回顧區間未看到此任務的系統歷程，先列為日報缺口；補歷程或新增任務流程待日報穩定後再推。'`
);

replaceAll(
  `targetDate: formatLocalDate(yesterday),`,
  `targetDate: targetWindow.label,`
);

if (!app.includes('function dailyBriefTargetWindow(')) {
  app = app.replace(
    `function startOfLocalDay(date: Date) {`,
    `function dailyBriefTargetWindow(today: Date) {
  const end = addDays(today, -1);
  const start = today.getDay() === 1 ? addDays(today, -3) : end;
  return {
    start,
    end,
    label: formatDateRange(start, end)
  };
}

function formatDateRange(start: Date, end: Date) {
  const startText = formatLocalDate(start);
  const endText = formatLocalDate(end);
  return startText === endText ? startText : startText + '~' + endText;
}

function startOfLocalDay(date: Date) {`
  );
}

if (!app.includes('function withinLocalDateRange(')) {
  app = app.replace(
    `function onOrBeforeLocalDate(value: string, target: Date) {`,
    `function withinLocalDateRange(value: string, start: Date, end: Date) {
  const date = parseLocalDate(value);
  if (!date) return false;
  const time = startOfLocalDay(date).getTime();
  return time >= startOfLocalDay(start).getTime() && time <= startOfLocalDay(end).getTime();
}

function onOrBeforeLocalDate(value: string, target: Date) {`
  );
}

fs.writeFileSync(appPath, app, 'utf8');
