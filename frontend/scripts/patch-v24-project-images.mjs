import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
const cssPath = new URL('../src/styles.css', import.meta.url);
const typesPath = new URL('../src/types.ts', import.meta.url);

let app = fs.readFileSync(appPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');
let types = fs.readFileSync(typesPath, 'utf8');

if (!types.includes('ImageUrl?: string;')) {
  types = types.replace(
    '  Remark?: string;\n};',
    '  Remark?: string;\n  ImageUrl?: string;\n  ImageSourcePath?: string;\n  ImageUpdatedAt?: string;\n};'
  );
}

if (!app.includes('function ProjectImage(')) {
  app = app.replace(
    'function Projects({ data, setModal, openProject }: { data: AppData; setModal: (modal: ModalState) => void; openProject: (project: Project) => void }) {',
    `function ProjectImage({ project, variant = 'thumb' }: { project: Project; variant?: 'thumb' | 'hero' }) {
  const url = String(project.ImageUrl || '').trim();
  const label = splitItemCodes(project.ItemCodes)[0] || project.ProjectCode || 'NO IMAGE';
  if (!url) {
    return <div className={\`project-image \${variant} empty\`}><span>{label}</span></div>;
  }
  return <img className={\`project-image \${variant}\`} src={url} alt={project.ProjectName || project.ProjectCode} loading="lazy" />;
}

function Projects({ data, setModal, openProject }: { data: AppData; setModal: (modal: ModalState) => void; openProject: (project: Project) => void }) {`
  );
}

if (!app.includes('project-name-cell')) {
  app = app.replace(
    `<span>
              <button className="project-name-button" onClick={() => openProject(project)}>{project.ProjectName}</button>
              <small>{renderItemChips(project.ItemCodes)}</small>
            </span>`,
    `<span>
              <div className="project-name-cell">
                <ProjectImage project={project} />
                <div>
                  <button className="project-name-button" onClick={() => openProject(project)}>{project.ProjectName}</button>
                  <small>{renderItemChips(project.ItemCodes)}</small>
                </div>
              </div>
            </span>`
  );
}

if (!app.includes('project-detail-main-grid')) {
  app = app.replace(
    /<div className="detail-grid">\s*<section className="detail-panel project-main-panel">([\s\S]*?)<\/section>\s*<section className="detail-panel">\s*<h3>[^<]*<\/h3>([\s\S]*?)<\/section>\s*<\/div>/,
    `<div className="detail-grid project-detail-main-grid">
        <div className="project-detail-left-stack">
          <section className="detail-panel project-main-panel">$1</section>
          <section className="detail-panel">
            <h3>${'\u5c08\u6848\u6458\u8981\u5224\u65b7'}</h3>$2
          </section>
        </div>
        <section className="detail-panel project-photo-panel">
          <div className="detail-title-row"><h3>${'\u7522\u54c1\u7167\u7247'}</h3><span className="muted">{project.ImageUpdatedAt ? \`${'\u66f4\u65b0'}：\${formatDateOnly(project.ImageUpdatedAt)}\` : '${'\u53ef\u5728\u7de8\u8f2f\u5c08\u6848\u4e2d\u66f4\u63db\u7167\u7247'}'}</span></div>
          <div className="project-visual-block"><ProjectImage project={project} variant="hero" /></div>
        </section>
      </div>`
  );
}

if (!app.includes('ImageUrl: changes.ImageUrl')) {
  app = app.replace(
    "    Remark: changes.Remark ?? project.Remark ?? ''\n  };",
    "    Remark: changes.Remark ?? project.Remark ?? '',\n    ImageUrl: changes.ImageUrl ?? project.ImageUrl ?? '',\n    ImageSourcePath: changes.ImageSourcePath ?? project.ImageSourcePath ?? '',\n    ImageUpdatedAt: changes.ImageUrl !== undefined ? new Date().toISOString().slice(0, 19).replace('T', ' ') : (project.ImageUpdatedAt ?? '')\n  };"
  );
}

if (!app.includes('name="ImageUrl"')) {
  app = app.replace(
    /(\s*<label className="wide-field">[^<]*<textarea name="Description" defaultValue=\{project\?\.Description \|\| ''\} placeholder="[^"]*" \/><\/label>)/,
    `      <label className="wide-field">${'\u7522\u54c1\u5716\u7247\u7db2\u5740'}<input name="ImageUrl" defaultValue={project?.ImageUrl || ''} placeholder="${'\u53ef\u8cbc'} Google Drive ${'\u5716\u7247\u7db2\u5740\u6216'} data:image/jpeg;base64..." /></label>
      <label className="wide-field">${'\u5716\u7247\u4f86\u6e90\u8def\u5f91'}<input name="ImageSourcePath" defaultValue={project?.ImageSourcePath || ''} placeholder="${'\u539f\u59cb\u5716\u7247\u4f4d\u7f6e\uff0c\u65b9\u4fbf\u65e5\u5f8c\u56de\u67e5\u6216\u63db\u5716'}" /></label>$1`
  );
}

if (!css.includes('.project-image')) {
  css += `

.project-name-cell {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
  width: 100%;
}
.project-image {
  display: block;
  border: 1px solid #d9e2e7;
  border-radius: 7px;
  background: #fff;
  object-fit: contain;
}
.project-image.thumb {
  width: 88px;
  height: 88px;
}
.project-image.hero {
  width: 100%;
  height: clamp(360px, 42vw, 620px);
}
.project-image.empty {
  display: grid;
  place-items: center;
  color: #718096;
  background: #f6f8fa;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
}
.project-image.empty.hero {
  font-size: 16px;
}
.project-visual-block {
  width: 100%;
}
.project-detail-main-grid {
  grid-template-columns: minmax(430px, 0.9fr) minmax(460px, 1.1fr);
  align-items: stretch;
}
.project-detail-left-stack {
  display: grid;
  gap: 14px;
  align-content: start;
}
.project-photo-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.project-photo-panel .project-visual-block {
  flex: 1;
  display: flex;
}
.project-photo-panel .project-image.hero {
  flex: 1;
}
`;
}

if (!css.includes('project-detail-main-grid')) {
  css += `

.project-name-cell {
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
}
.project-image.thumb {
  width: 88px;
  height: 88px;
}
.project-image.hero {
  width: 100%;
  height: clamp(360px, 42vw, 620px);
}
.project-detail-main-grid {
  grid-template-columns: minmax(430px, 0.9fr) minmax(460px, 1.1fr);
  align-items: stretch;
}
.project-detail-left-stack {
  display: grid;
  gap: 14px;
  align-content: start;
}
.project-photo-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.project-photo-panel .project-visual-block {
  flex: 1;
  display: flex;
  width: 100%;
}
.project-photo-panel .project-image.hero {
  flex: 1;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(cssPath, css);
fs.writeFileSync(typesPath, types);
