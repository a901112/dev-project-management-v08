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

if (!app.includes('project-visual-block')) {
  app = app.replace(
    /(\s*<div className="detail-title-row"><h3>.*?<\/h3><em className=\{`health-badge \$\{health\.tone\}`\}>\{health\.label\}<\/em><\/div>\s*)<div className="field-grid">/s,
    '$1<div className="project-visual-block"><ProjectImage project={project} variant="hero" /></div>\n          <div className="field-grid">'
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
    `      <label className="wide-field">專案說明<textarea name="Description" defaultValue={project?.Description || ''} placeholder="開案原因、客戶需求、注意事項" /></label>`,
    `      <label className="wide-field">產品圖片網址<input name="ImageUrl" defaultValue={project?.ImageUrl || ''} placeholder="可貼 Google Drive 圖片網址或 data:image/jpeg;base64..." /></label>
      <label className="wide-field">圖片來源路徑<input name="ImageSourcePath" defaultValue={project?.ImageSourcePath || ''} placeholder="原始圖片位置，方便日後回查或換圖" /></label>
      <label className="wide-field">專案說明<textarea name="Description" defaultValue={project?.Description || ''} placeholder="開案原因、客戶需求、注意事項" /></label>`
  );
}

if (!css.includes('.project-image')) {
  css += `

.project-name-cell {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  align-items: start;
  gap: 9px;
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
  width: 54px;
  height: 54px;
}
.project-image.hero {
  width: min(260px, 100%);
  height: 220px;
  margin-bottom: 12px;
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
  display: flex;
  align-items: center;
}
`;
}

fs.writeFileSync(appPath, app);
fs.writeFileSync(cssPath, css);
fs.writeFileSync(typesPath, types);
