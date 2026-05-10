export type Role = 'Admin' | 'PM' | 'Purchasing' | 'Sales' | 'Engineer' | 'Viewer';

export type User = {
  UserId: string;
  Account?: string;
  Password?: string;
  Email: string;
  DisplayName: string;
  Role: Role;
  IsActive: string;
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
};

export type AppData = {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
  erpOrderLines?: ErpOrderLine[];
  comments: Record<string, string>[];
  transitions: Record<string, string>[];
  taskTypes: string[];
};

export type LoginResult = {
  token: string;
  user: User;
};
