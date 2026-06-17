import fs from 'node:fs';

const apiPath = new URL('../src/api.ts', import.meta.url);
let api = fs.readFileSync(apiPath, 'utf8');

api = api.replace(
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: false, IncludeImages: false }),",
  "getAppData: (token: string) => jsonp<AppData>('getAppData', { Token: token, ActorEmail: token, IncludeActivityLogs: true, IncludeImages: false }),"
);

fs.writeFileSync(apiPath, api, 'utf8');
