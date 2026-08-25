import type { AppData, LoginResult, MutationResult, Project, UserWorkReport } from './types';

const defaultApiUrl = 'https://script.google.com/a/macros/asiasurge.com/s/AKfycbwZtncBGTvjtiplhFLjxXDP5PeR1fIs0IpyJpHqw3VuYbUJwp6HNcYias2eqEha8F8Q/exec';

export const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL || defaultApiUrl;

let callbackSeq = 0;

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function isRetryableLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message === 'Apps Script API timeout' || message === 'Unable to load Apps Script API';
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function jsonpOnce<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const callbackName = `__pmApiCallback${Date.now()}_${callbackSeq++}`;
  const params = new URLSearchParams({
    action,
    payload: JSON.stringify(payload),
    callback: callbackName
  });
  params.set('_', `${Date.now()}_${callbackSeq}`);

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

async function jsonp<T>(action: string, payload: Record<string, unknown> = {}, retryCount = 0): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await jsonpOnce<T>(action, payload);
    } catch (error) {
      if (attempt >= retryCount || !isRetryableLoadError(error)) {
        if (action === 'getAppData' && isRetryableLoadError(error)) {
          throw new Error(`開發資料暫時無法載入，已自動重試 ${retryCount} 次仍失敗。請稍後按「重新整理」。`);
        }
        throw error;
      }
      await wait((attempt + 1) * 1000);
    }
  }
}

export const api = {
  login: (account: string, password: string) => jsonp<LoginResult>('login', { Account: account, Password: password }),
  getAppData: (token: string, options: Record<string, unknown> = {}) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false, ...options }, 2),
  getProjectImage: (token: string, payload: Record<string, unknown>) => jsonp<Project>('getProjectImage', { ...payload, ActorEmail: token }),
  createTask: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('createTask', { ...payload, ActorEmail: token }),
  createProject: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('createProject', { ...payload, ActorEmail: token }),
  updateProject: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProject', { ...payload, ActorEmail: token }),
  updateProjectHistory: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProjectHistory', { ...payload, ActorEmail: token }),
  updateProjectStage: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProjectStage', { ...payload, ActorEmail: token }),
  updateProjectPatch: (token: string, payload: Record<string, unknown>) => jsonp<Project>('updateProjectPatch', { ...payload, ActorEmail: token }),
  createTaskWorkLog: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('createTaskWorkLog', { ...payload, ActorEmail: token }),
  submitTaskResult: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('submitTaskResult', { ...payload, ActorEmail: token }),
  reviewTask: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('reviewTask', { ...payload, ActorEmail: token }),
  createFollowUpTask: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('createFollowUpTask', { ...payload, ActorEmail: token }),
  editTask: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('editTask', { ...payload, ActorEmail: token }),
  voidTask: (token: string, payload: Record<string, unknown>) => jsonp<MutationResult>('voidTask', { ...payload, ActorEmail: token }),
  getUserWorkReport: (token: string, payload: Record<string, unknown>) => jsonp<UserWorkReport>('getUserWorkReport', { ...payload, ActorEmail: token })
};
