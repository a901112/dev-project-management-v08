import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const apiPath = new URL('../src/api.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let api = fs.readFileSync(apiPath, 'utf8');

if (!api.includes('updateProjectStage:')) {
  api = api.replace(
    "  updateProjectHistory: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProjectHistory', { ...payload, ActorEmail: token }),",
    "  updateProjectHistory: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProjectHistory', { ...payload, ActorEmail: token }),\n  updateProjectStage: (token: string, payload: Record<string, unknown>) => jsonp<AppData>('updateProjectStage', { ...payload, ActorEmail: token }),"
  );
}

app = app.replaceAll(
  "applyData(await api.updateProject(token, projectPayload(project, { Stage: stage })));",
  "applyData(await api.updateProjectStage(token, { ProjectId: project.ProjectId, Stage: stage }));"
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(apiPath, api);
