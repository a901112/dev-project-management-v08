import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const stylesPath = new URL('../src/styles.css', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function r(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

app = r(app, `<TaskTable data={data} tasks={allTasks} user={user} setModal={setModal} />`, `<TaskTable data={data} tasks={allTasks} user={user} setModal={setModal} openProject={openProject} />`);
app = r(app, `<TaskCards data={data} tasks={myTasks} user={user} mode="assignee" setModal={setModal} applyData={setData} token={token} />`, `<TaskCards data={data} tasks={myTasks} user={user} mode="assignee" setModal={setModal} applyData={setData} token={token} openProject={openProject} />`);
app = r(app, `<TaskCards data={data} tasks={reviewTasks} user={user} mode="review" setModal={setModal} applyData={setData} token={token} />`, `<TaskCards data={data} tasks={reviewTasks} user={user} mode="review" setModal={setModal} applyData={setData} token={token} openProject={openProject} />`);

app = r(app, `function TaskTable({ data, tasks, user, setModal, compact = false }: { data: AppData; tasks: Task[]; user: User; setModal?: (modal: ModalState) => void; compact?: boolean }) {`, `function TaskTable({ data, tasks, user, setModal, openProject, compact = false }: { data: AppData; tasks: Task[]; user: User; setModal?: (modal: ModalState) => void; openProject?: (project: Project) => void; compact?: boolean }) {`);
app = r(app, `<span>{task.ProjectCode}<small>{projectName(data, task.ProjectId)}</small></span>`, `<span><ProjectLink data={data} task={task} openProject={openProject} /></span>`);

if (!app.includes('function ProjectLink(')) {
  app = r(app, `function TaskCards({ data, tasks, user, mode, setModal, applyData, token }: { data: AppData; tasks: Task[]; user: User; mode: 'assignee' | 'review'; setModal: (modal: ModalState) => void; applyData: (data: AppData) => void; token: string }) {`, `function ProjectLink({ data, task, openProject, inline = false }: { data: AppData; task: Task; openProject?: (project: Project) => void; inline?: boolean }) {
  const project = findTaskProject(data, task);
  const name = project?.ProjectName || projectName(data, task.ProjectId);
  if (!project || !openProject) {
    return inline ? <>{task.ProjectCode}</> : <>{task.ProjectCode}<small>{name}</small></>;
  }
  const button = (
    <button className="project-context-link" onClick={() => openProject(project)}>
      {task.ProjectCode}
    </button>
  );
  return inline ? button : <>{button}<small>{name}</small></>;
}

function TaskCards({ data, tasks, user, mode, setModal, applyData, token, openProject }: { data: AppData; tasks: Task[]; user: User; mode: 'assignee' | 'review'; setModal: (modal: ModalState) => void; applyData: (data: AppData) => void; token: string; openProject: (project: Project) => void }) {`);
}

app = r(app, `<span>{task.TaskCode} / {task.ProjectCode} / {task.TaskType}</span>`, `<span>{task.TaskCode} / <ProjectLink data={data} task={task} openProject={openProject} inline /> / {task.TaskType}</span>`);

if (!app.includes('function findTaskProject(')) {
  app = r(app, `function displayUser(data: AppData, email: string) {`, `function findTaskProject(data: AppData, task: Task) {
  return data.projects.find((project) => String(project.ProjectId) === String(task.ProjectId) || project.ProjectCode === task.ProjectCode);
}

function displayUser(data: AppData, email: string) {`);
}

if (!styles.includes('.project-context-link')) {
  styles += `

.project-context-link {
  border: 0;
  padding: 0;
  color: #245b74;
  background: transparent;
  font-weight: 800;
  text-align: left;
}
.project-context-link:hover { text-decoration: underline; }
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
