import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v60 marker not found: ${label}`);
  return source.replace(from, to);
}

function replaceIfPresent(source, from, to) {
  return source.includes(from) ? source.replace(from, to) : source;
}

const reportDate = '2026-06-16';
const targetDate = '2026-06-15';
const generatedAt = '2026-06-16 08:00:00';

const reportObjects = [
  {
    ReportId: 'DR-20260616-MT21',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'mt21@asiasurge.com',
    PersonName: '陳哲易',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/15 更新 31-4087 軟墊片與 76950 / 32-2150 相關估價追蹤；今日注意 878114PC/878114APC 到期、64262 與 64249/79092 後續確認。'
  },
  {
    ReportId: 'DR-20260616-MT1',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'mt1@asiasurge.com',
    PersonName: '郭譩捷',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/15 針對 75423B/75423E/30008B 等樣件或異常做確認；今日注意 39-1283、964244、977433CA、816404CH 到期事項。'
  },
  {
    ReportId: 'DR-20260616-RD22',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'rd22@asiasurge.com',
    PersonName: '陳駿琪',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/15 系統未看到明確新增歷程；今日注意 63774、50229 V2、979096 相關追蹤。'
  },
  {
    ReportId: 'DR-20260616-RD21',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'rd21@asiasurge.com',
    PersonName: '李境梧',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/15 回報 16211 與多筆樣件/鋆件追蹤；今日注意 13601DB、64262、64249、79092、979096 等近期到期項目。'
  },
  {
    ReportId: 'DR-20260616-RD4',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'rd4@asiasurge.com',
    PersonName: 'Peggy',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/15 處理覆判、樣檢與供應商確認；今日注意 39-0086、39-0080、77332、32-1385、17-5626。'
  },
  {
    ReportId: 'DR-20260616-SALES2',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'sales2@asiasurge.com',
    PersonName: '林家慧',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/15 補登 A78896 與樣件/寄件相關追蹤；今日注意 DHL 寄件、971265 與客戶承認/樣件回覆。'
  },
  {
    ReportId: 'DR-20260616-MANAGER',
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: 'Jimmy@asiasurge.com',
    PersonName: '主管總覽',
    GeneratedBy: 'Codex',
    GeneratedAt: generatedAt,
    Status: '日報草稿',
    Summary: '6/16 08:00 前台未自動出現日報，需修正前台資料補缺與 Apps Script 日報分頁輸出；今日仍需列出到期/逾期與未來 7 天內工作。'
  }
];

function row(key, seq, email, section, sort, taskId, taskCode, projectId, projectCode, itemNo, itemNameShort, aiContent, sourceType, sourceIds, confidence, actionRequired, reviewStatus) {
  return {
    ItemId: `DRI-20260616-${key}-${seq}`,
    ReportId: `DR-20260616-${key}`,
    ReportDate: reportDate,
    TargetDate: targetDate,
    PersonEmail: email,
    SectionType: section,
    SortOrder: String(sort),
    TaskId: taskId,
    TaskCode: taskCode,
    ProjectId: projectId,
    ProjectCode: projectCode,
    ItemNo: itemNo,
    ItemNameShort: itemNameShort,
    AIContent: aiContent,
    SourceType: sourceType,
    SourceIds: sourceIds,
    Confidence: String(confidence),
    ActionRequired: actionRequired ? 'TRUE' : 'FALSE',
    ReviewStatus: reviewStatus
  };
}

const itemObjects = [
  row('MT21', '001', 'mt21@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '6/15', '系統新增歷程', '6/15 更新 31-4087 軟墊片估價追蹤，並持續確認 76950 / 32-2150 相關供應商回覆。', 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('MT21', '002', 'mt21@asiasurge.com', 'today_attention', 2, '41', 'TASK-20260513-041', '31', 'DEV-20240822-001', '878114PC/878114APC', '樣品確認', '今天到期，需確認黑五樣品供應商回覆是否可結案或需改期。', 'Task', 'Tasks:41', 0.85, true, '待處理'),
  row('MT21', '003', 'mt21@asiasurge.com', 'today_attention', 3, '227', 'TASK-20260603-227', '246', 'DEV-20260601-246', '31-4087', '軟墊片估價', '6/17 到期，需追蹤 PDF 報價與廠商回覆，避免卡住下一步判斷。', 'Task', 'Tasks:227', 0.85, true, '待處理'),
  row('MT21', '004', 'mt21@asiasurge.com', 'today_attention', 4, '259/261/270', 'TASK-20260610-259/TASK-20260610-261/TASK-20260611-270', '', '', '64249/79092/64262', '樣件與寄送', '64249、79092、64262 皆在近一週內需追蹤，請確認樣件狀態、寄出時間與下一步。', 'Task', 'Tasks:259;Tasks:261;Tasks:270', 0.8, true, '待處理'),
  row('MT21', '005', 'mt21@asiasurge.com', 'system_gap', 5, '245', 'TASK-20260604-245', '256', 'DEV-20260604-256', '76950/32-2150', '歷程完整性', '若估價、電話追蹤或供應商回覆只留在口頭/零散紀錄，需補回 TaskWorkLogs，否則隔日日報會短少。', 'SystemInference', 'Tasks:245', 0.75, true, '待補歷程'),

  row('MT1', '001', 'mt1@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '6/15', '系統新增歷程', '6/15 針對 75423B、75423E、30008B 等樣件或異常項目做確認與更新。', 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('MT1', '002', 'mt1@asiasurge.com', 'today_attention', 2, '267/273/279', 'TASK-20260611-267/TASK-20260611-273/TASK-20260612-279', '243/116/124', 'DEV-20260527-243/DEV-20260411-001/DEV-20260422-001', '39-1283/964244/977433CA', '今日到期', '今天到期，需確認樣件或異常結果是否已回覆，並補上可追蹤的下一步。', 'Task', 'Tasks:267;Tasks:273;Tasks:279', 0.85, true, '待處理'),
  row('MT1', '003', 'mt1@asiasurge.com', 'today_attention', 3, '268', 'TASK-20260611-268', '17', 'DEV-20230801-001', '816404CH', '樣品確認', '今天到期，需確認樣品或供應商回覆是否完成，若仍未完成要更新下一次追蹤時間。', 'Task', 'Tasks:268', 0.85, true, '待處理'),
  row('MT1', '004', 'mt1@asiasurge.com', 'system_gap', 4, '251/252/253/264/265', 'TASK-20260610-251/TASK-20260610-252/TASK-20260610-253/TASK-20260610-264/TASK-20260610-265', '', '', '75423E/75423B/30008B/71361/71362', '樣檢歷程', '樣檢或覆判若不是正式任務內動作，仍需先補進對應任務歷程；沒有任務的支援事項暫不推入口。', 'SystemInference', 'Tasks:251;Tasks:252;Tasks:253;Tasks:264;Tasks:265', 0.75, true, '待補歷程'),

  row('RD22', '001', 'rd22@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '6/15', '系統新增歷程', '6/15 目前系統未看到陳駿琪明確新增歷程；若當日有支援或樣檢，需等日報穩定後再納入非任務入口。', 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.8, true, '待確認'),
  row('RD22', '002', 'rd22@asiasurge.com', 'today_attention', 2, '262', 'TASK-20260610-262', '204', 'DEV-20260507-004', '63774', '待覆判/確認', '需確認 63774 是否已有覆判或下一步，若有供應商/客戶回覆要補入歷程。', 'Task', 'Tasks:262', 0.85, true, '待處理'),
  row('RD22', '003', 'rd22@asiasurge.com', 'today_attention', 3, '239/271/272', 'TASK-20260604-239/TASK-20260611-271/TASK-20260611-272', '', '', '50229 V2/979096', '近期到期', '50229 V2、979096 需確認樣件/圖面/供應商回覆狀態，避免到期後沒有下一步。', 'Task', 'Tasks:239;Tasks:271;Tasks:272', 0.85, true, '待處理'),

  row('RD21', '001', 'rd21@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '6/15', '系統新增歷程', '6/15 回報 16211 與多筆樣件/鋆件追蹤，需持續確認近期到期項目的回覆結果。', 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('RD21', '002', 'rd21@asiasurge.com', 'today_attention', 2, '230/263/269/258/260/272', 'TASK-20260603-230/TASK-20260610-263/TASK-20260611-269/TASK-20260610-258/TASK-20260610-260/TASK-20260611-272', '', '', '16211/13601DB/64262/64249/79092/979096', '近期到期', '多筆項目落在一週內到期，需確認是否已有回覆、樣件寄送或主管判斷。', 'Task', 'Tasks:230;Tasks:263;Tasks:269;Tasks:258;Tasks:260;Tasks:272', 0.85, true, '待處理'),
  row('RD21', '003', 'rd21@asiasurge.com', 'manager_decision', 3, '248', 'TASK-20260604-248', '65', 'DEV-20260213-001', '79104/79104A/79104C', 'NG 判斷', '若 79104 系列仍為 NG 或需改模/改圖，需由主管確認接受方案與後續任務拆分。', 'Task', 'Tasks:248', 0.85, true, '待主管確認'),

  row('RD4', '001', 'rd4@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '6/15', '系統新增歷程', '6/15 處理覆判、樣檢與供應商確認，包含 977433CA、39-0086、32-1385 等項目。', 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('RD4', '002', 'rd4@asiasurge.com', 'today_attention', 2, '228/229/240/241', 'TASK-20260603-228/TASK-20260603-229/TASK-20260604-240/TASK-20260604-241', '', '', '39-0086/39-0080/77332/32-1385', '樣檢/覆判', '需確認樣檢或覆判結果是否已回填，若需供應商再確認要補下一次追蹤時間。', 'Task', 'Tasks:228;Tasks:229;Tasks:240;Tasks:241', 0.85, true, '待處理'),
  row('RD4', '003', 'rd4@asiasurge.com', 'today_attention', 3, '280', 'TASK-20260612-280', '257', 'DEV-20260612-257', '17-5626', '估價/樣件', '6/22 到期，需確認 MOQ、樣件與報價條件，避免下週沒有可判斷資料。', 'Task', 'Tasks:280', 0.8, true, '待處理'),

  row('SALES2', '001', 'sales2@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '6/15', '系統新增歷程', '6/15 補登 A78896 與樣件/寄件相關追蹤，需確認 DHL 與客戶承認項目是否已完成。', 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('SALES2', '002', 'sales2@asiasurge.com', 'today_attention', 2, '', '', '', '', 'DHL/971265', '寄件追蹤', 'DHL 寄件與 971265 需確認寄出、客戶回覆或下一次追蹤日期，避免只停留在口頭回報。', 'Task', 'Tasks:274;Tasks:275;Tasks:276;Tasks:278', 0.8, true, '待處理'),
  row('SALES2', '003', 'sales2@asiasurge.com', 'today_attention', 3, '24/25/26/28/31', 'TASK-20260511-024/TASK-20260511-025/TASK-20260511-026/TASK-20260511-028/TASK-20260511-031', '', '', '客戶承認/樣件', '多筆客戶承認與樣件待追蹤，需確認是否已通知量產、是否需補件或是否要主管介入。', 'Task', 'Tasks:24;Tasks:25;Tasks:26;Tasks:28;Tasks:31', 0.8, true, '待處理'),

  row('MANAGER', '001', 'Jimmy@asiasurge.com', 'system_gap', 1, '', '', '', '', '6/16 日報', '系統缺口', '6/16 08:00 前台未看到日報；目前判斷為 Apps Script 未完整回傳 DailyReports/DailyReportItems，前台需先補缺顯示。', 'SystemInference', 'AppsScriptAPI;GitHubPages', 0.95, true, '待系統修正'),
  row('MANAGER', '002', 'Jimmy@asiasurge.com', 'manager_decision', 2, '', '', '', '', '固定排程規則', '主管規則', '固定規則：週一抓五六日；週二到週五抓前一工作日。今日應注意永遠抓當天逾期與未來 7 天內到期工作。', 'SystemInference', 'DailyReportRule', 0.9, true, '已確認規則')
];

const reportsMarker = 'const dailyReportFallbackReports: DailyReportRow[] = [';
const itemsMarker = 'const dailyReportFallbackItems: DailyReportRow[] = [';

if (!app.includes('DR-20260616-MT21')) {
  if (!app.includes(reportsMarker)) throw new Error('patch-v60 marker not found: daily report fallback reports');
  if (!app.includes(itemsMarker)) throw new Error('patch-v60 marker not found: daily report fallback items');
  app = app.replace(reportsMarker, `${reportsMarker}\n  ...${JSON.stringify(reportObjects)},`);
  app = app.replace(itemsMarker, `${itemsMarker}\n  ...${JSON.stringify(itemObjects)},`);
}

if (!app.includes('function mergeDailyReportFallbackRows(')) {
  app = replaceRequired(
    app,
    `function DailyReportsPage`,
    `function mergeDailyReportFallbackRows(rows: DailyReportRow[] | undefined, fallbackRows: DailyReportRow[], key: string) {
  const merged = new Map<string, DailyReportRow>();
  fallbackRows.forEach((row) => merged.set(String(row[key] || ''), row));
  (rows || []).forEach((row) => merged.set(String(row[key] || ''), row));
  return Array.from(merged.values());
}

function DailyReportsPage`,
    'daily report merge helper'
  );
}

app = replaceIfPresent(
  app,
  `  const reports = extended.dailyReports && extended.dailyReports.length > 0 ? extended.dailyReports : dailyReportFallbackReports;
  const items = extended.dailyReportItems && extended.dailyReportItems.length > 0 ? extended.dailyReportItems : dailyReportFallbackItems;
  const nonTaskLogs = extended.nonTaskWorkLogs && extended.nonTaskWorkLogs.length > 0 ? extended.nonTaskWorkLogs : dailyReportFallbackNonTaskLogs;`,
  `  const reports = mergeDailyReportFallbackRows(extended.dailyReports, dailyReportFallbackReports, 'ReportId');
  const items = mergeDailyReportFallbackRows(extended.dailyReportItems, dailyReportFallbackItems, 'ItemId');
  const nonTaskLogs = mergeDailyReportFallbackRows(extended.nonTaskWorkLogs, dailyReportFallbackNonTaskLogs, 'NonTaskWorkLogId');`
);

app = replaceIfPresent(
  app,
  `  const reports = ext.dailyReports && ext.dailyReports.length > 0 ? ext.dailyReports : dailyReportFallbackReports;
  const items = ext.dailyReportItems && ext.dailyReportItems.length > 0 ? ext.dailyReportItems : dailyReportFallbackItems;
  const nonTaskLogs = ext.nonTaskWorkLogs && ext.nonTaskWorkLogs.length > 0 ? ext.nonTaskWorkLogs : dailyReportFallbackNonTaskLogs;`,
  `  const reports = mergeDailyReportFallbackRows(ext.dailyReports, dailyReportFallbackReports, 'ReportId');
  const items = mergeDailyReportFallbackRows(ext.dailyReportItems, dailyReportFallbackItems, 'ItemId');
  const nonTaskLogs = mergeDailyReportFallbackRows(ext.nonTaskWorkLogs, dailyReportFallbackNonTaskLogs, 'NonTaskWorkLogId');`
);

app = replaceIfPresent(
  app,
  `  const reports = extended.dailyReports || [];
  const items = extended.dailyReportItems || [];
  const nonTaskLogs = extended.nonTaskWorkLogs || [];`,
  `  const reports = mergeDailyReportFallbackRows(extended.dailyReports, dailyReportFallbackReports, 'ReportId');
  const items = mergeDailyReportFallbackRows(extended.dailyReportItems, dailyReportFallbackItems, 'ItemId');
  const nonTaskLogs = mergeDailyReportFallbackRows(extended.nonTaskWorkLogs, dailyReportFallbackNonTaskLogs, 'NonTaskWorkLogId');`
);

fs.writeFileSync(appPath, app, 'utf8');
