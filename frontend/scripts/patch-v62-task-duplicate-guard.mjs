import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v62 marker not found: ${label}`);
  return source.replace(from, to);
}

if (!app.includes('function duplicateTaskMessage(')) {
  app = replaceRequired(
    app,
    `function normalizeProjectItemCode(value: string) {
  return String(value || '').trim().toUpperCase();
}`,
    `function duplicateTaskMessage(tasks: Task[], payload: Record<string, FormDataEntryValue>, projectId: unknown, currentTaskId = '') {
  const normalizedProjectId = String(projectId || '').trim();
  const taskType = normalizeDuplicateTaskValue(payload.TaskType);
  const taskName = normalizeDuplicateTaskValue(payload.TaskName);
  const assigneeEmail = String(payload.AssigneeEmail || '').trim();
  const dueDate = normalizeDuplicateTaskDate(payload.DueDate);
  if (!normalizedProjectId || !taskType || !taskName || !assigneeEmail || !dueDate) return '';

  const duplicate = tasks.find((task) =>
    String(task.TaskId || '') !== String(currentTaskId || '') &&
    String(task.ProjectId || '').trim() === normalizedProjectId &&
    normalizeDuplicateTaskValue(task.TaskType) === taskType &&
    normalizeDuplicateTaskValue(task.TaskName) === taskName &&
    sameEmail(task.AssigneeEmail, assigneeEmail) &&
    normalizeDuplicateTaskDate(task.DueDate) === dueDate &&
    unfinishedStatuses.includes(task.TaskStatus)
  );

  return duplicate
    ? \`已有相同未完成任務：\${duplicate.TaskCode}。請先使用既有任務，或調整任務名稱、承辦人、預計結案日後再新增。\`
    : '';
}

function normalizeDuplicateTaskValue(value: unknown) {
  return String(value || '').trim().replace(/\\s+/g, ' ').toLowerCase();
}

function normalizeDuplicateTaskDate(value: unknown) {
  const parsed = parseLocalDate(String(value || ''));
  return parsed ? formatLocalDate(parsed) : String(value || '').trim().replace(/\\//g, '-');
}

function normalizeProjectItemCode(value: string) {
  return String(value || '').trim().toUpperCase();
}`,
    'duplicate task helpers'
  );
}

if (!app.includes('duplicateTaskMessage(data.tasks')) {
  app = replaceRequired(
    app,
    `      if (modal.type === 'project' || modal.type === 'projectEdit') {
        const duplicateMessage = duplicateProjectItemMessage(
          data.projects,
          String(payload.ItemCodes || ''),
          modal.type === 'projectEdit' ? modal.project.ProjectId : ''
        );
        if (duplicateMessage) throw new Error(duplicateMessage);
      }
      let next: AppData;`,
    `      if (modal.type === 'project' || modal.type === 'projectEdit') {
        const duplicateMessage = duplicateProjectItemMessage(
          data.projects,
          String(payload.ItemCodes || ''),
          modal.type === 'projectEdit' ? modal.project.ProjectId : ''
        );
        if (duplicateMessage) throw new Error(duplicateMessage);
      }
      if (modal.type === 'task' || modal.type === 'followUp') {
        const taskProjectId = payload.ProjectId || (modal.type === 'task' ? modal.project?.ProjectId : modal.task.ProjectId);
        const duplicateMessage = duplicateTaskMessage(data.tasks, payload, taskProjectId, modal.type === 'followUp' ? modal.task.TaskId : '');
        if (duplicateMessage) throw new Error(duplicateMessage);
      }
      let next: AppData;`,
    'ActionModal duplicate task preflight'
  );
}

app = app.replace(
  `    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }`,
  `    } catch (err) {
      setError(cleanActionError(err));
    } finally {
      setIsSubmitting(false);
    }`
);

if (!app.includes('function cleanActionError(')) {
  app = replaceRequired(
    app,
    `function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}`,
    `function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function cleanActionError(error: unknown) {
  const message = errorMessage(error);
  const duplicateMatch = message.match(/偵測到可能重複新增：([^。]+)。/);
  if (duplicateMatch) {
    return \`系統偵測到相同任務可能已建立：\${duplicateMatch[1]}。請先關閉視窗，在任務清單搜尋該 TaskCode；不要重複送出。\`;
  }
  return message.split('\\n')[0].replace(/\\s+at\\s+.*$/s, '').trim() || message;
}`,
    'clean action error helper'
  );
}

fs.writeFileSync(appPath, app, 'utf8');
