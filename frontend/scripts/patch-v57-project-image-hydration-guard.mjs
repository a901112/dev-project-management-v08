import fs from 'fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const oldHydrationMerge = `      setData((current) => current ? mergeProjectIntoData(current, { ...project, ...imageProject }) : current);`;
const guardedHydrationMerge = `      setData((current) => {
        if (!current) return current;
        const mergedProject = { ...project, ...imageProject };
        return {
          ...current,
          projects: current.projects.map((item) =>
            String(item.ProjectId) === String(mergedProject.ProjectId) ? mergedProject : item
          )
        };
      });`;

if (app.includes(oldHydrationMerge)) {
  app = app.replace(oldHydrationMerge, guardedHydrationMerge);
} else if (app.includes('mergeProjectIntoData(current, { ...project, ...imageProject })')) {
  app = app.replace(
    /setData\(\(current\) => current \? mergeProjectIntoData\(current, \{ \.\.\.project, \.\.\.imageProject \}\) : current\);/,
    guardedHydrationMerge.trim()
  );
}

fs.writeFileSync(appPath, app);
