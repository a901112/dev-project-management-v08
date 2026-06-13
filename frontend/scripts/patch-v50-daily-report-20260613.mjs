import fs from 'node:fs';

const appPath = new URL('../src/App.tsx', import.meta.url);
let app = fs.readFileSync(appPath, 'utf8');

const reportObjects = [
  {
    ReportId: 'DR-20260613-MT21',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'mt21@asiasurge.com',
    PersonName: '陳哲易',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 補登 32-2150 常勝原樣評估、76950 邏得估價更正、963981-2R/3R 試模排程，並追蹤 79118 供應商估價。'
  },
  {
    ReportId: 'DR-20260613-MT1',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'mt1@asiasurge.com',
    PersonName: '郭譩捷',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 新建 977433CA 樣檢任務，更新 78978 圖面給供應商，處理 75423E/75423B 圖面差異，並追蹤 30008B 包材。'
  },
  {
    ReportId: 'DR-20260613-RD22',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'rd22@asiasurge.com',
    PersonName: '陳駿琪',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 完成 979096 2D/3D 工程圖並已覆判，63774 新版樣檢完成待覆判，50229 V2 檢具已完成並通過覆判。'
  },
  {
    ReportId: 'DR-20260613-SALES2',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'sales2@asiasurge.com',
    PersonName: '林家慧',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 補登多筆 DHL 寄樣待客戶確認，處理 971265E/971265D 出貨退回資訊，並建立 17-5626 通瑞溢估價任務。'
  },
  {
    ReportId: 'DR-20260613-RD21',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'rd21@asiasurge.com',
    PersonName: '李境梧',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 完成 13474 紙圖資料上傳並通過覆判；79104 系列樣檢 NG 被退回，需與供應商確認後續。'
  },
  {
    ReportId: 'DR-20260613-RD4',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'rd4@asiasurge.com',
    PersonName: 'Peggy',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 建立 977433CA 樣檢任務，完成多筆覆判與退回處理，並更新 63928、39-0086、62192 等估價與樣品流程。'
  },
  {
    ReportId: 'DR-20260613-MANAGER',
    ReportDate: '2026-06-13',
    TargetDate: '2026-06-12',
    PersonEmail: 'Jimmy@asiasurge.com',
    PersonName: '主管總覽',
    GeneratedBy: 'Codex',
    GeneratedAt: '2026-06-13 08:00:00',
    Status: '日報草稿',
    Summary: '6/12 重點是待覆判、79104 NG 退回、逾期與未來一周到期任務追蹤；系統面需補日報排程、API 回傳與前台快取。'
  }
];

const itemObjects = [
  { ItemId: 'DRI-20260613-MT21-001', ReportId: 'DR-20260613-MT21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskId: '243', TaskCode: 'TASK-20260604-243', ProjectId: '254', ProjectCode: 'DEV-20260604-254', ItemNo: '32-2150', ItemNameShort: '常勝估價', AIContent: '6/12 補登：常勝沒有現品，需要樣品評估；6/11 原樣已寄常勝。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:64', Confidence: '0.95', ActionRequired: 'FALSE', ReviewStatus: '可確認' },
  { ItemId: 'DRI-20260613-MT21-002', ReportId: 'DR-20260613-MT21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskId: '245', TaskCode: 'TASK-20260604-245', ProjectId: '256', ProjectCode: 'DEV-20260604-256', ItemNo: '76950', ItemNameShort: '邏得估價', AIContent: '更正前次紀錄：6/9 發估邏得，6/10 提供原樣，請供應商同時估開模與全加工兩種做法，預計 6/17 回估。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:69', Confidence: '0.95', ActionRequired: 'TRUE', ReviewStatus: '6/17 追蹤' },
  { ItemId: 'DRI-20260613-MT21-003', ReportId: 'DR-20260613-MT21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '3', TaskId: '52', TaskCode: 'TASK-20260513-052', ProjectId: '38', ProjectCode: 'DEV-20250310-001', ItemNo: '963981-2R/3R', ItemNameShort: '試模排程', AIContent: '翌名先用現有材料試模 OK，正確材料需購入後再排試模；因機台急單，預計 6/22 後才能試模。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:70', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待 6/22 後追蹤' },
  { ItemId: 'DRI-20260613-MT21-004', ReportId: 'DR-20260613-MT21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt21@asiasurge.com', SectionType: 'today_attention', SortOrder: '4', TaskId: '193', TaskCode: 'TASK-20260527-193', ProjectId: '233', ProjectCode: 'DEV-20260525-233', ItemNo: '79118', ItemNameShort: '供應商估價', AIContent: '通瑞溢因 B/C 規格加工難度高不估，已加估興光與泓源；預計 6/15 提出報價，今日需確認是否需要其他備援供應商。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:71', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '6/15 追蹤' },
  { ItemId: 'DRI-20260613-MT21-005', ReportId: 'DR-20260613-MT21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt21@asiasurge.com', SectionType: 'today_attention', SortOrder: '5', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '多筆 6/12 到期任務', ItemNameShort: '逾期未回報', AIContent: '79089、62195、78860/78861、913612、13612/13612B、64247/64248 等 6/12 到期任務仍需確認最新狀態或補下一追蹤日。', SourceType: 'Tasks', SourceIds: 'DueDate:2026-06-12;Assignee:mt21', Confidence: '0.75', ActionRequired: 'TRUE', ReviewStatus: '待補狀態' },

  { ItemId: 'DRI-20260613-MT1-001', ReportId: 'DR-20260613-MT1', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt1@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskId: '279', TaskCode: 'TASK-20260612-279', ProjectId: '124', ProjectCode: 'DEV-20260422-001', ItemNo: '977433CA', ItemNameShort: '進料檢驗', AIContent: '6/12 新建 977433CA 進料檢驗任務，說明為補圖後再進行樣檢，預計 6/16 到期。', SourceType: 'Tasks+TaskTransitions', SourceIds: 'Tasks:279;TaskTransitions:672', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '6/16 到期' },
  { ItemId: 'DRI-20260613-MT1-002', ReportId: 'DR-20260613-MT1', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt1@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskId: '93', TaskCode: 'TASK-20260513-093', ProjectId: '183', ProjectCode: 'DEV-20250602-002', ItemNo: '78978', ItemNameShort: '圖面更新', AIContent: '6/12 已更新圖面給供應商，請供應商依圖重新送樣；NextFollowUpDate 為 6/15。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:65,76', Confidence: '0.95', ActionRequired: 'TRUE', ReviewStatus: '6/15 追蹤' },
  { ItemId: 'DRI-20260613-MT1-003', ReportId: 'DR-20260613-MT1', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt1@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '3', TaskId: '251', TaskCode: 'TASK-20260610-251', ProjectId: '224', ProjectCode: 'DEV-20260519-224', ItemNo: '75423E', ItemNameShort: '圖面送簽', AIContent: '6/12 確認高度與圖面差異較大，原因是廠商現行規格，已依現況更新圖面送簽。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:72', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待簽核/回報' },
  { ItemId: 'DRI-20260613-MT1-004', ReportId: 'DR-20260613-MT1', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt1@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '4', TaskId: '252', TaskCode: 'TASK-20260610-252', ProjectId: '224', ProjectCode: 'DEV-20260519-224', ItemNo: '75423B', ItemNameShort: '比對異常', AIContent: '6/12 比對圖面異常，目前借庫存品量測比對中。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:73', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '進行中' },
  { ItemId: 'DRI-20260613-MT1-005', ReportId: 'DR-20260613-MT1', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'mt1@asiasurge.com', SectionType: 'today_attention', SortOrder: '5', TaskId: '253', TaskCode: 'TASK-20260610-253', ProjectId: '17', ProjectCode: 'DEV-20230801-001', ItemNo: '30008B', ItemNameShort: '包材紙板', AIContent: '6/12 追蹤包材紙板預計下周寄到，屬未來一周內需追蹤事項；71361/71362 也仍需確認檢驗進度。', SourceType: 'TaskWorkLogs+Tasks', SourceIds: 'TaskWorkLogs:75;Tasks:264,265', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '下周追蹤' },

  { ItemId: 'DRI-20260613-RD22-001', ReportId: 'DR-20260613-RD22', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd22@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskId: '271', TaskCode: 'TASK-20260611-271', ProjectId: '220', ProjectCode: 'DEV-20260512-220', ItemNo: '979096', ItemNameShort: '2D/3D 工程圖', AIContent: '6/12 完成 2D 與 3D 工程圖，檔案已存入相關資料夾，同日 PM 覆判完成。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:674,679', Confidence: '0.95', ActionRequired: 'FALSE', ReviewStatus: '已完成' },
  { ItemId: 'DRI-20260613-RD22-002', ReportId: 'DR-20260613-RD22', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd22@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskId: '262', TaskCode: 'TASK-20260610-262', ProjectId: '204', ProjectCode: 'DEV-20260507-004', ItemNo: '63774 新版', ItemNameShort: '樣檢完成', AIContent: '6/12 樣檢完成，檔案已存入相關資料夾，目前狀態為待覆判。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:685', Confidence: '0.95', ActionRequired: 'TRUE', ReviewStatus: '待主管覆判' },
  { ItemId: 'DRI-20260613-RD22-003', ReportId: 'DR-20260613-RD22', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd22@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '3', TaskId: '239', TaskCode: 'TASK-20260604-239', ProjectId: '74', ProjectCode: 'DEV-20220825-001', ItemNo: '50229 V2', ItemNameShort: '檢具製作', AIContent: '50229 V2 檢具設計已完成，6/12 PM 覆判完成。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:678', Confidence: '0.9', ActionRequired: 'FALSE', ReviewStatus: '已完成' },
  { ItemId: 'DRI-20260613-RD22-004', ReportId: 'DR-20260613-RD22', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd22@asiasurge.com', SectionType: 'today_attention', SortOrder: '4', TaskId: '262', TaskCode: 'TASK-20260610-262', ProjectId: '204', ProjectCode: 'DEV-20260507-004', ItemNo: '63774 新版', ItemNameShort: '待覆判', AIContent: '63774 新版樣檢已完成但仍待覆判，今天需確認主管覆判結果與後續處理。', SourceType: 'Tasks', SourceIds: 'Tasks:262', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '待覆判' },

  { ItemId: 'DRI-20260613-SALES2-001', ReportId: 'DR-20260613-SALES2', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'sales2@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: 'A71164Z/A64259/A19136A/A64226B/13622', ItemNameShort: 'DHL 寄樣', AIContent: '6/12 補登多筆 DHL 已寄出並待客戶確認，主要下一追蹤日為 6/22。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:58-62', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待客戶確認' },
  { ItemId: 'DRI-20260613-SALES2-002', ReportId: 'DR-20260613-SALES2', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'sales2@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskId: '172', TaskCode: 'TASK-20260525-172', ProjectId: '47', ProjectCode: 'DEV-20240827-001', ItemNo: '971265E/971265D', ItemNameShort: '出貨處理', AIContent: '6/12 補登：971265D 因未熱處理退回 Peggy 報廢；另轉小林 DHL 多項 #5775 出貨，包含 71275C、971265B、971265D、971265E。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:63', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待確認出貨紀錄' },
  { ItemId: 'DRI-20260613-SALES2-003', ReportId: 'DR-20260613-SALES2', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'sales2@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '3', TaskId: '280', TaskCode: 'TASK-20260612-280', ProjectId: '257', ProjectCode: 'DEV-20260612-257', ItemNo: '17-5626', ItemNameShort: '通瑞溢估價', AIContent: '6/12 建立 17-5626 通瑞溢估價任務，預計 6/22 到期，承辦為 Peggy。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:684', Confidence: '0.9', ActionRequired: 'FALSE', ReviewStatus: '已建立任務' },
  { ItemId: 'DRI-20260613-SALES2-004', ReportId: 'DR-20260613-SALES2', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'sales2@asiasurge.com', SectionType: 'today_attention', SortOrder: '4', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '客戶承認/寄樣', ItemNameShort: '資料完整性', AIContent: '多筆寄樣下一追蹤日集中在 6/22，雖非一周內到期，但今天可先確認 DHL 單號、承認對象與任務歷程是否補齊。', SourceType: 'SystemInference', SourceIds: 'TaskWorkLogs:58-63', Confidence: '0.75', ActionRequired: 'TRUE', ReviewStatus: '待補完整資訊' },

  { ItemId: 'DRI-20260613-RD21-001', ReportId: 'DR-20260613-RD21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskId: '231', TaskCode: 'TASK-20260603-231', ProjectId: '250', ProjectCode: 'DEV-20260603-250', ItemNo: '13474', ItemNameShort: '紙圖資料', AIContent: '6/12 完成 13474 紙圖資料上傳，並於 13:20 通過 PM 覆判。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:673,675', Confidence: '0.95', ActionRequired: 'FALSE', ReviewStatus: '已完成' },
  { ItemId: 'DRI-20260613-RD21-002', ReportId: 'DR-20260613-RD21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd21@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskId: '248', TaskCode: 'TASK-20260604-248', ProjectId: '65', ProjectCode: 'DEV-20260213-001', ItemNo: '79104/79104A/79104C', ItemNameShort: '樣檢 NG 退回', AIContent: '79104 系列樣檢結果被退回，原因為樣檢 NG，需聯繫供應商處理。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:676', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待供應商處理' },
  { ItemId: 'DRI-20260613-RD21-003', ReportId: 'DR-20260613-RD21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd21@asiasurge.com', SectionType: 'today_attention', SortOrder: '3', TaskId: '230', TaskCode: 'TASK-20260603-230', ProjectId: '249', ProjectCode: 'DEV-20260603-249', ItemNo: '16211 本體+三款接頭', ItemNameShort: '逾期未回報', AIContent: '16211 本體+三款接頭任務 6/12 到期仍進行中，需補最新狀態或下一追蹤日。', SourceType: 'Tasks', SourceIds: 'Tasks:230', Confidence: '0.8', ActionRequired: 'TRUE', ReviewStatus: '待補狀態' },
  { ItemId: 'DRI-20260613-RD21-004', ReportId: 'DR-20260613-RD21', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd21@asiasurge.com', SectionType: 'manager_decision', SortOrder: '4', TaskId: '248', TaskCode: 'TASK-20260604-248', ProjectId: '65', ProjectCode: 'DEV-20260213-001', ItemNo: '79104 系列', ItemNameShort: 'NG 後續', AIContent: '需決定 79104 系列 NG 後續：要求供應商重做、修正後重送，或調整開發方向。', SourceType: 'Tasks+TaskTransitions', SourceIds: 'Tasks:248;TaskTransitions:676', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '待主管決定' },

  { ItemId: 'DRI-20260613-RD4-001', ReportId: 'DR-20260613-RD4', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd4@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '1', TaskId: '279', TaskCode: 'TASK-20260612-279', ProjectId: '124', ProjectCode: 'DEV-20260422-001', ItemNo: '977433CA', ItemNameShort: '建立樣檢任務', AIContent: '6/12 建立 977433CA 進料檢驗任務，指派郭譩捷，說明為補圖後再進行樣檢。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:672', Confidence: '0.9', ActionRequired: 'FALSE', ReviewStatus: '已建立' },
  { ItemId: 'DRI-20260613-RD4-002', ReportId: 'DR-20260613-RD4', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd4@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '2', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '13474/76097/50229/979096', ItemNameShort: 'PM 覆判完成', AIContent: '6/12 覆判完成 13474、76097、50229 檢具與 979096 等任務；79104 系列則退回處理。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:675-679', Confidence: '0.9', ActionRequired: 'FALSE', ReviewStatus: '可確認' },
  { ItemId: 'DRI-20260613-RD4-003', ReportId: 'DR-20260613-RD4', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd4@asiasurge.com', SectionType: 'yesterday_progress', SortOrder: '3', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '63928/39-0086/62192', ItemNameShort: '估價與樣品流程', AIContent: '63928 更新 MOQ 至 500PCS 待回覆；39-0086 重新發信給統亞；62192 開關已寄 4pcs 給富添打樣。', SourceType: 'TaskWorkLogs', SourceIds: 'TaskWorkLogs:66-68', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待供應商回覆' },
  { ItemId: 'DRI-20260613-RD4-004', ReportId: 'DR-20260613-RD4', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'rd4@asiasurge.com', SectionType: 'today_attention', SortOrder: '4', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '39-0086/39-0080/39-1283/32-1385', ItemNameShort: '6/12 到期估價', AIContent: '多筆 6/12 到期估價仍需確認是否已回覆或補下一追蹤日，避免停留在進行中未回報。', SourceType: 'Tasks', SourceIds: 'DueDate:2026-06-12;Assignee:rd4', Confidence: '0.8', ActionRequired: 'TRUE', ReviewStatus: '待追蹤' },

  { ItemId: 'DRI-20260613-MANAGER-001', ReportId: 'DR-20260613-MANAGER', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'manager_decision', SortOrder: '1', TaskId: '248', TaskCode: 'TASK-20260604-248', ProjectId: '65', ProjectCode: 'DEV-20260213-001', ItemNo: '79104 系列', ItemNameShort: '樣檢 NG', AIContent: '79104 系列已退回，請決定後續要供應商重做、修正後重送，或改變開發方向。', SourceType: 'TaskTransitions', SourceIds: 'TaskTransitions:676', Confidence: '0.9', ActionRequired: 'TRUE', ReviewStatus: '待主管決定' },
  { ItemId: 'DRI-20260613-MANAGER-002', ReportId: 'DR-20260613-MANAGER', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'today_attention', SortOrder: '2', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '待覆判任務', ItemNameShort: '今日覆判清單', AIContent: '63774 新版樣檢、23093/23094 第二次送樣、50229 V2 檢具、32-0071 估價、36-1348 估價等需確認是否仍待覆判。', SourceType: 'Tasks+TaskTransitions', SourceIds: 'Tasks:72,136,238,247,262', Confidence: '0.85', ActionRequired: 'TRUE', ReviewStatus: '待確認' },
  { ItemId: 'DRI-20260613-MANAGER-003', ReportId: 'DR-20260613-MANAGER', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'system_gap', SortOrder: '3', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '日報自動化/API', ItemNameShort: '系統缺口', AIContent: '今天沒有自動產生日報，因為尚未設定 8 點排程；線上 Apps Script 也尚未回傳 DailyReports/DailyReportItems，前台目前只能靠 fallback 顯示。', SourceType: 'SystemInference', SourceIds: 'CodexRuntime;AppsScriptAPI', Confidence: '1', ActionRequired: 'TRUE', ReviewStatus: '需部署 API/設定排程' },
  { ItemId: 'DRI-20260613-MANAGER-004', ReportId: 'DR-20260613-MANAGER', ReportDate: '2026-06-13', TargetDate: '2026-06-12', PersonEmail: 'Jimmy@asiasurge.com', SectionType: 'system_gap', SortOrder: '4', TaskId: '', TaskCode: '', ProjectId: '', ProjectCode: '', ItemNo: '前台載入', ItemNameShort: '效能問題', AIContent: 'GitHub Pages 靜態檔載入正常，但 getAppData 回應包過大且常需 10-20 秒；需改成先用快取顯示，再背景更新，並正式部署精簡版 API。', SourceType: 'SystemInference', SourceIds: 'PerformanceCheck:2026-06-13', Confidence: '0.95', ActionRequired: 'TRUE', ReviewStatus: '需改善' }
];

const reportsMarker = 'const dailyReportFallbackReports: DailyReportRow[] = [';
const itemsMarker = 'const dailyReportFallbackItems: DailyReportRow[] = [';

if (!app.includes('DR-20260613-MT21')) {
  if (!app.includes(reportsMarker)) throw new Error('patch-v50 marker not found: daily report fallback reports');
  if (!app.includes(itemsMarker)) throw new Error('patch-v50 marker not found: daily report fallback items');
  app = app.replace(reportsMarker, `${reportsMarker}\n  ...${JSON.stringify(reportObjects)},`);
  app = app.replace(itemsMarker, `${itemsMarker}\n  ...${JSON.stringify(itemObjects)},`);
}

fs.writeFileSync(appPath, app, 'utf8');
