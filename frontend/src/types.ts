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
  comments: Record<string, string>[];
  transitions: Record<string, string>[];
  taskTypes: string[];
};

export type LoginResult = {
  token: string;
  user: User;
};
