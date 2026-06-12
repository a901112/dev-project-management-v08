import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`patch-v47 marker not found: ${label}`);
  return source.replace(from, to);
}

const fallbackBlock = String.raw`
const dailyReportFallbackReports: DailyReportRow[] = [
  { ReportId: 'DR-20260612-MT21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt21@asiasurge.com', PersonName: '陳哲易', Status: 'AI草稿', Summary: '系統看到一筆6/11估價追蹤，但內容疑似32-2150常勝而任務綁在76950；另963981-2R/3R 6/11到期未見當日更新。' },
  { ReportId: 'DR-20260612-MT1', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt1@asiasurge.com', PersonName: '郭譩捷', Status: 'AI草稿', Summary: '62084量測完成並已覆判；76097量測完成但仍待覆判；另有多筆6/12到期進料檢驗需要今天排程或補回報。' },
  { ReportId: 'DR-20260612-RD22', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd22@asiasurge.com', PersonName: '陳駿琪', Status: 'AI草稿', Summary: '64271/64272工程照片完成並覆判；50229 V2檢具完成但待覆判；979096新版圖面需6/16前完成。若有支援或臨時交辦，需由系統非任務工作入口補登。' },
  { ReportId: 'DR-20260612-RD21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd21@asiasurge.com', PersonName: '李境梧', Status: 'AI草稿', Summary: '79104/79104A/79104C樣品進料檢驗完成並判NG；今天需要主管決定退回、重做或接受調整方式。' },
  { ReportId: 'DR-20260612-SALES2', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'sales2@asiasurge.com', PersonName: '林家慧', Status: 'AI草稿', Summary: '6/11建立多個客戶樣件承認任務；8:00前未見本人6/11工作歷程，8:09-8:11才補登DHL已寄與待客戶確認。' },
  { ReportId: 'DR-20260612-MANAGER', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'Jimmy@asiasurge.com', PersonName: '主管總覽', Status: 'AI草稿', Summary: '今日主管重點為64200缺件處理方案補登、79104系列NG判定、長時間待覆判任務，以及非任務工作回報機制。' }
];

const dailyReportFallbackItems: DailyReportRow[] = [
  { ItemId: 'DRI-20260612-MT21-001', ReportId: 'DR-20260612-MT21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskCode: 'TASK-20260604-245', ProjectCode: 'DEV-20260604-256', ItemNo: '76950/32-2150', ItemNameShort: '估價追蹤', AIContent: '6/11 09:22有補一筆估價追蹤：6/8已發估，供應商沒有現品，需要原樣評估，待原樣寄常勝。注意：該歷程目前綁在Task245「76950整組估價邏得」，但內容像32-2150常勝，需本人確認是否綁錯任務。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:53', Confidence: '0.75', ActionRequired: 'TRUE', ReviewStatus: '待人員確認' },
  { ItemId: 'DRI-20260612-MT21-002', ReportId: 'DR-20260612-MT21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt21@asiasurge.com', SectionType: 'today_attention', SortOrder: '2', TaskCode: 'TASK-20260513-052', ProjectCode: 'DEV-20250310-001', ItemNo: '963981-2R/3R', ItemNameShort: '曲軸箱主軸承', AIContent: '這筆打樣追蹤曾排6/11確認，但8:00前未看到6/11結果；今天請補上試模、尺寸調整與送樣日是否仍維持6/25。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:35', Confidence: '0.8', ActionRequired: 'TRUE', ReviewStatus: '待補歷程' },
  { ItemId: 'DRI-20260612-MT21-003', ReportId: 'DR-20260612-MT21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt21@asiasurge.com', SectionType: 'system_gap', SortOrder: '3', TaskCode: 'TASK-20260604-245', ProjectCode: 'DEV-20260604-256', ItemNo: '76950/32-2150', ItemNameShort: '任務綁定疑似混用', AIContent: '系統歷程內容與任務名稱不一致，請把32-2150常勝與76950邏得分開補正，避免日報判讀錯誤。', SourceType: 'SystemInference', SourceIds: 'Tasks:245;TaskWorkLogs:53', Confidence: '0.7', ActionRequired: 'TRUE', ReviewStatus: '待人員確認' },
  { ItemId: 'DRI-20260612-MT1-001', ReportId: 'DR-20260612-MT1', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt1@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskCode: 'TASK-20260610-254', ProjectCode: 'DEV-20250224-001', ItemNo: '62084', ItemNameShort: '興光/秀孟版本', AIContent: '62084進料檢驗量測完成，10:06提交、10:38已覆判；補充內容提到興光版本與秀孟版本需分開管理。', SourceType: 'TaskTransitions+TaskWorkLogs', SourceIds: 'TaskTransitions:654,659;TaskWorkLogs:56', Confidence: '0.9', ActionRequired: 'FALSE', ReviewStatus: '可確認' },
  { ItemId: 'DRI-20260612-MT1-002', ReportId: 'DR-20260612-MT1', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt1@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskCode: 'TASK-20260610-255', ProjectCode: 'DEV-20260512-217', ItemNo: '76097', ItemNameShort: '進料檢驗', AIContent: '76097進料檢驗量測完成，已提交完成但目前仍是待覆判。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:655', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待主管覆判' },
  { ItemId: 'DRI-20260612-MT1-003', ReportId: 'DR-20260612-MT1', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt1@asiasurge.com', SectionType: 'today_attention', SortOrder: '3', TaskCode: 'TASK-20260611-267', ProjectCode: 'DEV-20260527-243', ItemNo: '39-1283', ItemNameShort: '燈片估價', AIContent: '6/11新增孚克軒估價任務；今天確認圖面提供是否綁到正確Task267，並補下一次追蹤日。', SourceType: 'Tasks+TaskWorkLogs', SourceIds: 'Tasks:267;TaskWorkLogs:54-55', Confidence: '0.75', ActionRequired: 'TRUE', ReviewStatus: '待補歷程' },
  { ItemId: 'DRI-20260612-MT1-004', ReportId: 'DR-20260612-MT1', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt1@asiasurge.com', SectionType: 'today_attention', SortOrder: '4', ProjectCode: 'DEV-20260519-224/DEV-20230801-001', ItemNo: '75423E/75423B/30008B/71361/71362', ItemNameShort: '今日到期進料檢驗', AIContent: '6/12到期且8:00前仍未回報的進料檢驗包含75423E、75423B、30008B、71361、71362；今天需排檢驗或補交期。', SourceType: 'Tasks', SourceIds: 'Tasks:251,252,253,264,265', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '待回報' },
  { ItemId: 'DRI-20260612-MT1-005', ReportId: 'DR-20260612-MT1', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'mt1@asiasurge.com', SectionType: 'system_gap', SortOrder: '5', ItemNo: '進料檢驗', ItemNameShort: '歷程品質', AIContent: '部分進料檢驗只看到完成或待覆判，缺少量測重點、異常照片或下一步；建議日後完成時補一行可供主管判斷的結論。', SourceType: 'SystemInference', SourceIds: 'Tasks;TaskTransitions', Confidence: '0.7', ActionRequired: 'TRUE', ReviewStatus: '教育訓練' },
  { ItemId: 'DRI-20260612-RD22-001', ReportId: 'DR-20260612-RD22', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd22@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskCode: 'TASK-20260604-235', ProjectCode: 'DEV-20260601-246', ItemNo: '64271/64272', ItemNameShort: '工程照片', AIContent: '64271與64272工程照片完成，檔案已存入相關資料夾，16:08已覆判。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:666,676', Confidence: '0.95', ActionRequired: 'FALSE', ReviewStatus: '可確認' },
  { ItemId: 'DRI-20260612-RD22-002', ReportId: 'DR-20260612-RD22', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd22@asiasurge.com', SectionType: 'today_attention', SortOrder: '2', TaskCode: 'TASK-20260604-239', ProjectCode: 'DEV-20220825-001', ItemNo: '50229 V2', ItemNameShort: '檢具製作', AIContent: '50229 V2檢具6/10已完成但仍待覆判；今天請主管覆判，若需等俊利報價請補下一追蹤日。', SourceType: 'Tasks', SourceIds: 'Tasks:239', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待主管覆判' },
  { ItemId: 'DRI-20260612-RD22-003', ReportId: 'DR-20260612-RD22', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd22@asiasurge.com', SectionType: 'today_attention', SortOrder: '3', TaskCode: 'TASK-20260611-271', ProjectCode: 'DEV-20260512-220', ItemNo: '979096', ItemNameShort: '圖面設變', AIContent: '979096供應商將開口縫角改R角，6/16前需完成新版圖面，後續交給樣檢。', SourceType: 'Tasks', SourceIds: 'Tasks:271,272', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '進行中' },
  { ItemId: 'DRI-20260612-RD22-004', ReportId: 'DR-20260612-RD22', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd22@asiasurge.com', SectionType: 'system_gap', SortOrder: '4', ItemNo: '支援/臨時交辦', ItemNameShort: '非任務工作入口', AIContent: '目前系統看不到支援、寄樣、協助樣檢、廠內協調等非任務工作的結構化入口；若這類工作有後續追蹤，應先由非任務工作回報登錄，再由主管確認是否轉成正式任務。', SourceType: 'SystemDesign', SourceIds: 'DailyReportRule', Confidence: '0.8', ActionRequired: 'TRUE', ReviewStatus: '制度待補' },
  { ItemId: 'DRI-20260612-RD21-001', ReportId: 'DR-20260612-RD21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskCode: 'TASK-20260604-248', ProjectCode: 'DEV-20260213-001', ItemNo: '79104/79104A/79104C', ItemNameShort: '樣品進料檢驗', AIContent: '79104系列樣品檢驗完成：三個樣品都有兩個沉頭孔偏心超過表定公差，判定NG；79104A另有表面處理缺少透明漆。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:670', Confidence: '0.95', ActionRequired: 'TRUE', ReviewStatus: '待主管覆判' },
  { ItemId: 'DRI-20260612-RD21-002', ReportId: 'DR-20260612-RD21', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'rd21@asiasurge.com', SectionType: 'manager_decision', SortOrder: '2', TaskCode: 'TASK-20260604-248', ProjectCode: 'DEV-20260213-001', ItemNo: '79104系列', ItemNameShort: 'NG後續處理', AIContent: '今天需要主管決定：退供應商重做、要求補透明漆並重送樣，或接受外型調整後續開發。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:670', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '待主管決定' },
  { ItemId: 'DRI-20260612-SALES2-001', ReportId: 'DR-20260612-SALES2', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'sales2@asiasurge.com', SectionType: 'after_8_update', SortOrder: '1', ItemNo: 'A71164Z/A19136A/A64226B', ItemNameShort: 'DHL寄樣', AIContent: '嚴格以6/12 08:00來看，這些6/11工作歷程當時尚未出現；8:09-8:11才補登已寄DHL，待客戶確認，下次追蹤日6/22。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:58-61', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '已補登但需確認' },
  { ItemId: 'DRI-20260612-SALES2-002', ReportId: 'DR-20260612-SALES2', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'sales2@asiasurge.com', SectionType: 'today_attention', SortOrder: '2', TaskCode: 'TASK-20260511-024/TASK-20260511-025', ProjectCode: 'DEV-20250613-001/DEV-20250718-001', ItemNo: '13601/13602/23093', ItemNameShort: '客戶承認待覆判', AIContent: '13601/13602與23093已完成但長時間待覆判；今天請主管覆判，家慧確認客戶承認通知與可出貨紀錄是否完整。', SourceType: 'Tasks', SourceIds: 'Tasks:24,25', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '待主管覆判' },
  { ItemId: 'DRI-20260612-SALES2-003', ReportId: 'DR-20260612-SALES2', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'sales2@asiasurge.com', SectionType: 'today_attention', SortOrder: '3', TaskCode: 'TASK-20260611-274/TASK-20260611-275/TASK-20260611-276/TASK-20260611-278', ProjectCode: 'DEV-20260108-001/DEV-20251222-001/DEV-20260512-216/DEV-20260507-003', ItemNo: 'A64237/A64226B/A71164Z/A78896', ItemNameShort: '客戶樣件承認', AIContent: '6/11新建多筆客戶樣件承認任務；今天確認是否已寄樣、承認對象與下一次跟催日期。', SourceType: 'Tasks', SourceIds: 'Tasks:274,275,276,278', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待補追蹤' },
  { ItemId: 'DRI-20260612-MANAGER-001', ReportId: 'DR-20260612-MANAGER', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'manager_decision', SortOrder: '1', TaskCode: 'TASK-20260603-220', ProjectCode: 'DEV-20250516-001', ItemNo: '64200', ItemNameShort: '缺件處理', AIContent: '系統顯示64200已退回、未通過，ResultReason只有「聯繫供應商」；今天需要補上供應商回覆、補件/退貨或其他處理方案與下一追蹤日，再由主管判斷處理方式。', SourceType: 'Tasks+SystemInference', SourceIds: 'Tasks:220', Confidence: '0.8', ActionRequired: 'TRUE', ReviewStatus: '待補歷程' },
  { ItemId: 'DRI-20260612-MANAGER-002', ReportId: 'DR-20260612-MANAGER', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'manager_decision', SortOrder: '2', TaskCode: 'TASK-20260604-248', ProjectCode: 'DEV-20260213-001', ItemNo: '79104系列', ItemNameShort: '樣檢NG', AIContent: '79104系列樣檢NG需今天決定處理方向，避免RD只停在待覆判、業務也無法對外回覆。', SourceType: 'Tasks', SourceIds: 'Tasks:248', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待主管決定' },
  { ItemId: 'DRI-20260612-MANAGER-003', ReportId: 'DR-20260612-MANAGER', ReportDate: '2026-06-12', TargetDate: '2026-06-11', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'system_gap', SortOrder: '3', ItemNo: '日報資料完整性', ItemNameShort: '制度缺口', AIContent: '目前系統資料多是任務狀態與短歷程，容易漏掉支援、樣檢協助、臨時交辦、廠內協調等每日工作。若要每天8點準確，需要前一天下班前完成WorkLog或非任務工作回報；隔天補登要標成補登。', SourceType: 'SystemInference', SourceIds: 'TaskWorkLogs;TaskTransitions', Confidence: '0.8', ActionRequired: 'TRUE', ReviewStatus: '教育訓練' }
];

const dailyReportFallbackNonTaskLogs: DailyReportRow[] = [];
`;

if (!app.includes('dailyReportFallbackReports')) {
  app = replaceRequired(
    app,
    `type DailyReportRow = Record<string, string>;

function DailyReportsPage`,
    `type DailyReportRow = Record<string, string>;

${fallbackBlock}

function DailyReportsPage`,
    'fallback constants'
  );
}

app = app.replace(
  `  const reports = extended.dailyReports || [];
  const items = extended.dailyReportItems || [];
  const nonTaskLogs = extended.nonTaskWorkLogs || [];`,
  `  const reports = extended.dailyReports && extended.dailyReports.length > 0 ? extended.dailyReports : dailyReportFallbackReports;
  const items = extended.dailyReportItems && extended.dailyReportItems.length > 0 ? extended.dailyReportItems : dailyReportFallbackItems;
  const nonTaskLogs = extended.nonTaskWorkLogs && extended.nonTaskWorkLogs.length > 0 ? extended.nonTaskWorkLogs : dailyReportFallbackNonTaskLogs;`
);

app = app.replace(
  `  const reports = ext.dailyReports || [];
  const items = ext.dailyReportItems || [];
  const nonTaskLogs = ext.nonTaskWorkLogs || [];`,
  `  const reports = ext.dailyReports && ext.dailyReports.length > 0 ? ext.dailyReports : dailyReportFallbackReports;
  const items = ext.dailyReportItems && ext.dailyReportItems.length > 0 ? ext.dailyReportItems : dailyReportFallbackItems;
  const nonTaskLogs = ext.nonTaskWorkLogs && ext.nonTaskWorkLogs.length > 0 ? ext.nonTaskWorkLogs : dailyReportFallbackNonTaskLogs;`
);

fs.writeFileSync(appPath, app, 'utf8');
