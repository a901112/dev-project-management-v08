import type { AppData, LoginResult, Project } from './types';

const defaultApiUrl = 'https://script.google.com/a/macros/asiasurge.com/s/AKfycbwZtncBGTvjtiplhFLjxXDP5PeR1fIs0IpyJpHqw3VuYbUJwp6HNcYias2eqEha8F8Q/exec';

export const appsScriptUrl = defaultApiUrl;

let callbackSeq = 0;
const pendingCreateTaskRequests = new Map<string, Promise<AppData>>();

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function jsonp<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const callbackName = `__pmApiCallback${Date.now()}_${callbackSeq++}`;
  const params = new URLSearchParams({
    action,
    payload: JSON.stringify(payload),
    callback: callbackName
  });

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('Apps Script API timeout'));
    }, 90000);

    function cleanup() {
      window.clearTimeout(timer);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    }

    (window as unknown as Record<string, unknown>)[callbackName] = (response: ApiResponse<T>) => {
      cleanup();
      if (response.ok && response.data !== undefined) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Apps Script API error'));
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Unable to load Apps Script API'));
    };

    script.src = `${appsScriptUrl}?${params.toString()}`;
    document.body.appendChild(script);
  });
}

function createTask(token: string, payload: Record<string, unknown>) {
  const requestPayload = { ...payload, ActorEmail: token };
  const key = [
    token,
    requestPayload.ProjectId,
    requestPayload.ProjectCode,
    requestPayload.TaskType,
    requestPayload.TaskName,
    requestPayload.AssigneeEmail,
    requestPayload.DueDate
  ].map((value) => String(value ?? '').trim().toLowerCase()).join('|');

  const pending = pendingCreateTaskRequests.get(key);
  if (pending) return pending;

  const request = jsonp<AppData>('createTask', requestPayload).finally(() => {
    pendingCreateTaskRequests.delete(key);
  });
  pendingCreateTaskRequests.set(key, request);
  return request;
}

export const api = {
  login: (account: string, password: string) => jsonp<LoginResult>('login', { Account: account, Password: password }),
  getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true }),
  createTask,
  createProject: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('createProject', { ...payload, ActorEmail: token }),
  updateProject: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProject', { ...payload, ActorEmail: token }),
  updateProjectPatch: (token: string, payload: Record<string, unknown>) => jsonp<Project>('updateProjectPatch', { ...payload, ActorEmail: token }),
  submitTaskResult: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('submitTaskResult', { ...payload, ActorEmail: token }),
  reviewTask: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('reviewTask', { ...payload, ActorEmail: token }),
  createFollowUpTask: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('createFollowUpTask', { ...payload, ActorEmail: token }),
  editTask: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('editTask', { ...payload, ActorEmail: token }),
  voidTask: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('voidTask', { ...payload, ActorEmail: token })
};
