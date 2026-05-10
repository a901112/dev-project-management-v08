import fs from 'node:fs';

const stylesPath = new URL('../src/styles.css', import.meta.url);
let styles = fs.readFileSync(stylesPath, 'utf8');

styles += `

/* Project list final grid override */
.project-list-grid {
  grid-template-columns: 170px minmax(280px, 1fr) 78px 120px 78px 82px 136px 88px 104px 142px !important;
  min-width: 1278px !important;
}
.project-panel .tr.project-list-grid:not(.th) {
  min-height: 70px !important;
}
.project-panel .tr.project-list-grid > span {
  align-items: flex-start;
  padding: 9px 8px !important;
}
.project-panel .tr.project-list-grid:not(.th) > span:nth-child(6) .status {
  width: auto;
  max-width: 72px;
}
.project-panel .tr.project-list-grid:not(.th) > span:nth-child(10) {
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 5px;
}
.project-panel .tr.project-list-grid:not(.th) > span:nth-child(10) .light {
  min-height: 30px;
  padding: 4px 8px;
}
`;

fs.writeFileSync(stylesPath, styles);
