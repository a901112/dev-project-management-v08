import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  `mode === 'assignee' && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus)`,
  `mode === 'assignee' && canWorkOnTask(task)`
);

app = app.replace(
  `mode === 'review' && task.TaskStatus === STATUS_PENDING`,
  `mode === 'review' && canReviewTaskNow(task)`
);

app = app.replace(
  `const editable = canEditTask(user, task) && [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(task.TaskStatus);`,
  `const editable = canEditTask(user, task) && canWorkOnTask(task);`
);

app = app.replace(
  `else if (modal.type === 'result') next = await api.submitTaskResult(token, { ...payload, TaskId: modal.task.TaskId, Action: modal.action });
      else if (modal.type === 'review') next = await api.reviewTask(token, { ...payload, TaskId: modal.task.TaskId, Action: modal.action });
      else if (modal.type === 'followUp') next = await api.createFollowUpTask(token, { ...payload, SourceTaskId: modal.task.TaskId });
      else if (modal.type === 'edit') next = await api.editTask(token, { ...payload, TaskId: modal.task.TaskId });
      else next = await api.voidTask(token, { ...payload, TaskId: modal.task.TaskId });`,
  `else if (modal.type === 'result') {
        if (!canWorkOnTask(latestTask(data, modal.task))) throw new Error('This task is no longer in progress or returned. Please refresh before submitting.');
        next = await api.submitTaskResult(token, { ...payload, TaskId: modal.task.TaskId, Action: modal.action });
      }
      else if (modal.type === 'review') {
        if (!canReviewTaskNow(latestTask(data, modal.task))) throw new Error('This task is no longer pending review. Please refresh before reviewing.');
        next = await api.reviewTask(token, { ...payload, TaskId: modal.task.TaskId, Action: modal.action });
      }
      else if (modal.type === 'followUp') next = await api.createFollowUpTask(token, { ...payload, SourceTaskId: modal.task.TaskId });
      else if (modal.type === 'edit') next = await api.editTask(token, { ...payload, TaskId: modal.task.TaskId });
      else {
        if (!canWorkOnTask(latestTask(data, modal.task))) throw new Error('This task is no longer in progress or returned, so it cannot be voided. Please refresh first.');
        next = await api.voidTask(token, { ...payload, TaskId: modal.task.TaskId });
      }`
);

if (!app.includes('function normalizedStatus(task: Task)')) {
  app = app.replace(
    `function canEditTask(user: User, task: Task) {
  return canManageProjects(user) || sameEmail(task.AssignedByEmail, user.Email);
}
`,
    `function canEditTask(user: User, task: Task) {
  return canManageProjects(user) || sameEmail(task.AssignedByEmail, user.Email);
}

function normalizedStatus(task: Task) {
  return String(task.TaskStatus || '').trim();
}

function canWorkOnTask(task: Task) {
  return [STATUS_IN_PROGRESS, STATUS_RETURNED].includes(normalizedStatus(task));
}

function canReviewTaskNow(task: Task) {
  return normalizedStatus(task) === STATUS_PENDING;
}

function latestTask(data: AppData, task: Task) {
  return data.tasks.find((item) => String(item.TaskId) === String(task.TaskId)) || task;
}
`
  );
}

fs.writeFileSync(appPath, app);
