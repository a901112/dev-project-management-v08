export type Role = 'Admin' | 'PM' | 'MIS' | 'Purchasing' | 'Sales' | 'Engineer' | 'Viewer' | 'SALES' | 'PURCHASING' | 'ENGINEER' | '璆剖?' | '撌亦?' | '?恣';

export type User = {
  UserId: string;
  Account?: string;
  Password?: string;
  Email: string;
  DisplayName: string;
  Role: Role;
  IsActive: string;
  LastLoginAt?: string;
  LastActiveAt?: string;
  LoginCount?: string;
};

export type Project = {
  ProjectId: string;
  ProjectCode: string;
  ProjectName: string;
  ItemCodes: string;
  OwnerEmail: string;
  Stage: string;
  Status: string;
  CreatedAt: string;
  PlannedCloseDate?: string;
  ProjectStrategy?: string;
  Priority?: string;
  Description?: string;
  Remark?: string;
  ImageUrl?: string;
  ImageSourcePath?: string;
  ImageUpdatedAt?: string;
  HistorySummary?: string;
  HistorySyncedAt?: string;
};

export type ProjectHistory = {
  ProjectCode: string;
  ProjectItemCodes: string;
  MatchedItemCode: string;
  SourceItemNo: string;
  CustomerItemNo: string;
  ItemName: string;
  Spec: string;
  Progress: string;
  HistorySummary: string;
  HistoryRaw: string;
  SourceRows: string;
  SourceUpdatedAt: string;
};

export type ErpOrderLine = {
  OrderKey: string;
  MatchedProjectItem: string;
  OrderType: string;
  OrderNo: string;
  Sequence: string;
  OrderDate: string;
  CustomerCode: string;
  CustomerName: string;
  CustomerOrderNo: string;
  ItemNo: string;
  CustomerItemNo: string;
  ItemName: string;
  Spec: string;
  Unit: string;
  OrderQty: string;
  DeliveredQty: string;
  UnshippedQty: string;
  DueDate: string;
  CloseCode: string;
  SourceUpdatedAt: string;
};

export type Task = {
  TaskId: string;
  TaskCode: string;
  ProjectId: string;
  ProjectCode: string;
  TaskType: string;
  TaskName: string;
  Description: string;
  AssignedByEmail: string;
  AssigneeEmail: string;
  StartDate: string;
  StandardHours: string;
  DueDate: string;
  CompletedAt: string;
  TaskStatus: string;
  TaskResult: string;
  ResultReason: string;
  SubmittedAt: string;
  ReviewedByEmail: string;
  ReviewedAt: string;
  ParentTaskId: string;
  NextTaskId: string;
  CreatedAt: string;
  UpdatedAt: string;
  ReturnCount?: string;
};

export type TaskWorkLog = {
  WorkLogId: string;
  TaskId: string;
  TaskCode: string;
  ProjectId: string;
  ProjectCode: string;
  LogDate: string;
  LogType: string;
  ContactTarget: string;
  Content: string;
  NextFollowUpDate: string;
  Hours: string;
  CreatedByEmail: string;
  CreatedAt: string;
  UpdatedAt: string;
  ReturnCount?: string;
};

export type DailyReport = {
  ReportId: string;
  ReportDate: string;
  TargetDate: string;
  PersonEmail: string;
  PersonName: string;
  GeneratedBy: string;
  GeneratedAt: string;
  Status: string;
  ConfirmedAt: string;
  ConfirmedByEmail: string;
  Summary: string;
  CreatedAt: string;
  UpdatedAt: string;
  ReturnCount?: string;
};

export type DailyReportItem = {
  ItemId: string;
  ReportId: string;
  ReportDate: string;
  TargetDate: string;
  PersonEmail: string;
  SectionType: string;
  SortOrder: string;
  TaskId: string;
  TaskCode: string;
  ProjectId: string;
  ProjectCode: string;
  ItemNo: string;
  ItemNameShort: string;
  AIContent: string;
  UserContent: string;
  SourceType: string;
  SourceIds: string;
  Confidence: string;
  ActionRequired: string;
  ReviewStatus: string;
  ConvertedType: string;
  ConvertedId: string;
  ConfirmedAt: string;
  UpdatedAt: string;
};

export type NonTaskWorkLog = {
  NonTaskWorkLogId: string;
  WorkDate: string;
  PersonEmail: string;
  WorkType: string;
  RelatedItemNo: string;
  RelatedItemNameShort: string;
  RelatedProjectId: string;
  RelatedProjectCode: string;
  RelatedTaskId: string;
  Content: string;
  HasFollowUp: string;
  FollowUpDate: string;
  WaitingFor: string;
  NeedsManagerDecision: string;
  ReviewStatus: string;
  ConvertedTaskId: string;
  SourceDailyReportItemId: string;
  CreatedByEmail: string;
  CreatedAt: string;
  UpdatedAt: string;
  Remark: string;
};

export type AppData = {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
  erpOrderLines?: ErpOrderLine[];
  projectHistories?: ProjectHistory[];
  workLogs?: TaskWorkLog[];
  dailyReports?: DailyReport[];
  dailyReportItems?: DailyReportItem[];
  nonTaskWorkLogs?: NonTaskWorkLog[];
  comments: Record<string, string>[];
  transitions: Record<string, string>[];
  taskTypes: string[];
};

export type MutationResult = {
  mutation: true;
  action?: string;
  currentUser?: User;
  project?: Project | null;
  task?: Task | null;
  nextTask?: Task | null;
  workLog?: TaskWorkLog | null;
  unchanged?: boolean;
};

export type UserWorkReportSummary = {
  Email: string;
  DisplayName: string;
  Role: string;
  LastLoginAt: string;
  LastActiveAt: string;
  LoginCount: number;
  LoginInRange: boolean;
  ActiveInRange: boolean;
  CreatedProjects: number;
  EditedProjects: number;
  StageChangedProjects: number;
  ClosedProjects: number;
  VoidedProjects: number;
  CreatedTasks: number;
  EditedTasks: number;
  SubmittedDoneTasks: number;
  SubmittedBlockedTasks: number;
  SubmittedRejectedTasks: number;
  ReviewedApprovedTasks: number;
  ReviewedReturnedTasks: number;
  ClosedTasks: number;
  VoidedTasks: number;
  CreatedFollowUpTasks: number;
  AssignedUnclosedTasks: number;
  AssignedActionRequiredTasks: number;
  AssignedOverdueTasks: number;
  PendingReviewByMeTasks: number;
  WorkLogs: number;
  Comments: number;
  TotalActions: number;
};

export type UserWorkReportDetail = {
  Time: string;
  UserEmail: string;
  UserName: string;
  Role: string;
  Type: string;
  Action: string;
  ProjectCode: string;
  ProjectName: string;
  TaskCode: string;
  TaskName: string;
  From: string;
  To: string;
  Note: string;
};

export type UserWorkReport = {
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  summaries: UserWorkReportSummary[];
  details: UserWorkReportDetail[];
};

export type LoginResult = {
  token: string;
  user: User;
};
