import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const reportDate = '2026-06-15';
const targetDate = '2026-06-13~2026-06-14';
const generatedAt = '2026-06-15 08:00:00';

const people = [
  ['MT21', 'mt21@asiasurge.com', '陳哲易', '週末 6/13-6/14 系統無新增歷程；今日注意 878114PC/878114APC 到期、31-4087 與工程照片 6/17 到期、76950/64262 後續追蹤。'],
  ['MT1', 'mt1@asiasurge.com', '郭譩捷', '週末 6/13-6/14 系統無新增歷程；今日注意 816404CH 到期、39-1283/964244/977433CA 6/16 到期，以及多筆 6/12 樣檢逾期需補狀態。'],
  ['RD22', 'rd22@asiasurge.com', '陳駿琪', '週末 6/13-6/14 系統無新增歷程；今日確認 63774 覆判完成後是否仍有圖面發放、樣檢或供應商通知。'],
  ['RD21', 'rd21@asiasurge.com', '李境梧', '週末 6/13-6/14 系統無新增歷程；今日注意 16211 逾期，13601DB、64262、64249、79092、979096 在本週陸續到期。'],
  ['RD4', 'rd4@asiasurge.com', 'Peggy', '週末 6/13-6/14 系統無新增歷程；今日注意多筆統亞/OKAY MOTOR 估價逾期，17-5626 於 6/22 到期。'],
  ['SALES2', 'sales2@asiasurge.com', '林家慧', '週末 6/13-6/14 系統無新增歷程；今日注意客戶承認待覆判/退回任務，以及 DHL 寄樣與 971265 後續追蹤。'],
  ['MANAGER', 'Jimmy@asiasurge.com', '主管總覽', '今天是週一，前日工作日報應抓週六日；即使週末無歷程，也要產生日報並保留今日應注意。']
];

const reportObjects = people.map(([key, email, name, summary]) => ({
  ReportId: `DR-20260615-${key}`,
  ReportDate: reportDate,
  TargetDate: targetDate,
  PersonEmail: email,
  PersonName: name,
  GeneratedBy: 'Codex',
  GeneratedAt: generatedAt,
  Status: '日報草稿',
  Summary: summary
}));

function row(key, seq, email, section, sort, taskId, taskCode, projectId, projectCode, itemNo, itemNameShort, aiContent, sourceType, sourceIds, confidence, actionRequired, reviewStatus) {
  return {
    ItemId: `DRI-20260615-${key}-${seq}`,
    ReportId: `DR-20260615-${key}`,
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

const weekendNoUpdate = '6/13-6/14 未看到 TaskWorkLogs 或 TaskTransitions，因此前日工作日報無新增進度；若週末有處理事項，請補歷程或登錄非任務工作。';

const itemObjects = [
  row('MT21', '001', 'mt21@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '週末更新', '系統歷程', weekendNoUpdate, 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('MT21', '002', 'mt21@asiasurge.com', 'today_attention', 2, '41', 'TASK-20260513-041', '31', 'DEV-20240822-001', '878114PC/878114APC', '樣品確認', '今天 6/15 到期，需確認黑胚樣品、弧度與供應商回覆是否可結案或需改期。', 'Task', 'Tasks:41', 0.85, true, '待處理'),
  row('MT21', '003', 'mt21@asiasurge.com', 'today_attention', 3, '227', 'TASK-20260603-227', '246', 'DEV-20260601-246', '31-4087', '報價追蹤', '6/17 到期，PDF 尺寸已給通瑞溢估價，今天應確認是否已有回估或需催覆。', 'Task', 'Tasks:227', 0.85, true, '待處理'),
  row('MT21', '004', 'mt21@asiasurge.com', 'today_attention', 4, '259/261', 'TASK-20260610-259/TASK-20260610-261', '', '', '64249/79092', '工程照片', '64249、64249A 與 79092 工程照片 6/17 到期，需確認照片是否已完成並上傳歷程。', 'Task', 'Tasks:259;Tasks:261', 0.8, true, '待處理'),
  row('MT21', '005', 'mt21@asiasurge.com', 'today_attention', 5, '245/270', 'TASK-20260604-245/TASK-20260611-270', '256/65', 'DEV-20260604-256/DEV-20260213-001', '76950/64262', '估價與樣檢', '76950 需追 6/17 回估；64262 樣檢 3PCS 預計 6/19 前完成，供應商需寄回原樣。', 'Task', 'Tasks:245;Tasks:270', 0.8, true, '待處理'),

  row('MT1', '001', 'mt1@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '週末更新', '系統歷程', weekendNoUpdate, 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('MT1', '002', 'mt1@asiasurge.com', 'today_attention', 2, '268', 'TASK-20260611-268', '17', 'DEV-20230801-001', '816404CH', '樣檢', '今天 6/15 到期，需確認樣檢是否完成、是否需補照片或問題紀錄。', 'Task', 'Tasks:268', 0.85, true, '待處理'),
  row('MT1', '003', 'mt1@asiasurge.com', 'today_attention', 3, '267/273/279', 'TASK-20260611-267/TASK-20260611-273/TASK-20260612-279', '243/116/124', 'DEV-20260527-243/DEV-20260411-001/DEV-20260422-001', '39-1283/964244/977433CA', '即將到期', '6/16 到期，需確認 39-1283 估價、964244 與 977433CA 樣檢/補圖進度。', 'Task', 'Tasks:267;Tasks:273;Tasks:279', 0.85, true, '待處理'),
  row('MT1', '004', 'mt1@asiasurge.com', 'today_attention', 4, '251/252/253/264/265', 'TASK-20260610-251/TASK-20260610-252/TASK-20260610-253/TASK-20260610-264/TASK-20260610-265', '224/17/87', 'DEV-20260519-224/DEV-20230801-001/DEV-20250324-001', '75423E/75423B/30008B/71361/71362', '逾期補狀態', '多筆 6/12 到期仍為進行中，今天需補最新結果或改期原因。', 'Task', 'Tasks:251;Tasks:252;Tasks:253;Tasks:264;Tasks:265', 0.85, true, '待處理'),

  row('RD22', '001', 'rd22@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '週末更新', '系統歷程', weekendNoUpdate, 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('RD22', '002', 'rd22@asiasurge.com', 'today_attention', 2, '262', 'TASK-20260610-262', '204', 'DEV-20260507-004', '63774', '覆判後確認', '6/12 已送覆判，6/15 早上系統顯示覆判完成；今天需確認是否還有圖面發放、樣檢或通知供應商的後續。', 'TaskTransitions', 'Tasks:262;TaskTransitions:689', 0.85, true, '待確認'),

  row('RD21', '001', 'rd21@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '週末更新', '系統歷程', weekendNoUpdate, 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('RD21', '002', 'rd21@asiasurge.com', 'today_attention', 2, '230', 'TASK-20260603-230', '249', 'DEV-20260602-249', '16211', '逾期補狀態', '16211 本體加三款接頭 6/12 到期仍為進行中，今天需補製圖、樣檢或供應商確認狀態。', 'Task', 'Tasks:230', 0.85, true, '待處理'),
  row('RD21', '003', 'rd21@asiasurge.com', 'today_attention', 3, '263/269/258/260/272', 'TASK-20260610-263/TASK-20260611-269/TASK-20260610-258/TASK-20260610-260/TASK-20260611-272', '', '', '13601DB/64262/64249/79092/979096', '一週內到期', '13601DB 6/17 到期；64262 製圖 6/18；64249、79092、979096 6/19 到期，今天需確認優先順序與是否有卡關。', 'Task', 'Tasks:263;Tasks:269;Tasks:258;Tasks:260;Tasks:272', 0.85, true, '待處理'),

  row('RD4', '001', 'rd4@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '週末更新', '系統歷程', weekendNoUpdate, 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('RD4', '002', 'rd4@asiasurge.com', 'today_attention', 2, '228/229/240/241', 'TASK-20260603-228/TASK-20260603-229/TASK-20260604-240/TASK-20260604-241', '', '', '39-0086/39-0080/77332/32-1385', '估價逾期', '多筆估價 6/11-6/12 已到期仍為進行中，今天需補供應商回覆或改期原因。', 'Task', 'Tasks:228;Tasks:229;Tasks:240;Tasks:241', 0.85, true, '待處理'),
  row('RD4', '003', 'rd4@asiasurge.com', 'today_attention', 3, '280', 'TASK-20260612-280', '257', 'DEV-20260612-257', '17-5626', '估價追蹤', '6/22 到期，已發通瑞溢估價 500 MIX，今天可確認是否需提前催覆或補資料。', 'Task', 'Tasks:280', 0.8, true, '待處理'),

  row('SALES2', '001', 'sales2@asiasurge.com', 'yesterday_progress', 1, '', '', '', '', '週末更新', '系統歷程', weekendNoUpdate, 'SystemInference', 'TaskWorkLogs;TaskTransitions', 0.9, false, '可確認'),
  row('SALES2', '002', 'sales2@asiasurge.com', 'today_attention', 2, '24/25/26/28/31', 'TASK-20260511-024/TASK-20260511-025/TASK-20260511-026/TASK-20260511-028/TASK-20260511-031', '', '', '客戶承認', '待補狀態', '多筆客戶承認任務仍待覆判、退回或進行中，需確認是否已通知量產、等待客戶或需要補歷程。', 'Task', 'Tasks:24;Tasks:25;Tasks:26;Tasks:28;Tasks:31', 0.8, true, '待處理'),
  row('SALES2', '003', 'sales2@asiasurge.com', 'today_attention', 3, '', '', '', '', 'DHL寄樣/971265', '寄樣追蹤', 'DHL 寄樣類任務下一追蹤集中在 6/22；971265 預計 6/25 追樣品，今天先確認是否有提前異動。', 'Task', 'Tasks:274;Tasks:275;Tasks:276;Tasks:278', 0.75, true, '待處理'),

  row('MANAGER', '001', 'Jimmy@asiasurge.com', 'system_gap', 1, '', '', '', '', '週一產生日報規則', '系統缺口', '今天是週一，前日工作日報應抓 6/13-6/14；即使週末無更新，也必須產生日報並保留今日應注意，避免首頁空白。', 'SystemInference', 'DailyReports;TaskWorkLogs;TaskTransitions', 0.95, true, '待系統修正'),
  row('MANAGER', '002', 'Jimmy@asiasurge.com', 'today_attention', 2, '', '', '', '', '逾期任務', '主管追蹤', '今天優先追逾期估價與樣檢：郭譩捷 6/12 多筆樣檢、Peggy 估價逾期、李境梧 16211 逾期，並確認陳哲易今日到期樣品。', 'SystemInference', 'Tasks', 0.9, true, '待主管確認'),
  row('MANAGER', '003', 'Jimmy@asiasurge.com', 'manager_decision', 3, '', '', '', '', '日報自動產生', '主管決定', '需決定是否把週一抓週末、無歷程仍產生提醒、非任務工作轉任務三件事列為日報產生規則。', 'SystemInference', 'DailyReports', 0.85, true, '待主管確認')
];

const reportsMarker = 'const dailyReportFallbackReports: DailyReportRow[] = [';
const itemsMarker = 'const dailyReportFallbackItems: DailyReportRow[] = [';

if (!app.includes('DR-20260615-MT21')) {
  if (!app.includes(reportsMarker)) throw new Error('patch-v54 marker not found: daily report fallback reports');
  if (!app.includes(itemsMarker)) throw new Error('patch-v54 marker not found: daily report fallback items');
  app = app.replace(reportsMarker, `${reportsMarker}\n  ...${JSON.stringify(reportObjects)},`);
  app = app.replace(itemsMarker, `${itemsMarker}\n  ...${JSON.stringify(itemObjects)},`);
}

fs.writeFileSync(appPath, app, 'utf8');
