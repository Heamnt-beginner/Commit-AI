import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CommitDraft_Key {
  id: UUIDString;
  __typename?: 'CommitDraft_Key';
}

export interface CommitHistory_Key {
  id: UUIDString;
  __typename?: 'CommitHistory_Key';
}

export interface CreateCommitDraftData {
  commitDraft_insert: CommitDraft_Key;
}

export interface CreateCommitDraftVariables {
  diffContent: string;
  status: string;
  repositoryId: UUIDString;
}

export interface CreateRepositoryData {
  repository_insert: Repository_Key;
}

export interface CreateRepositoryVariables {
  name: string;
  remoteUrl: string;
  ownerId: UUIDString;
}

export interface GetUserRepositoriesData {
  repositories: ({
    id: UUIDString;
    name: string;
    remoteUrl: string;
  } & Repository_Key)[];
}

export interface GetUserRepositoriesVariables {
  ownerId: UUIDString;
}

export interface ListCommitHistoryData {
  commitHistories: ({
    commitHash: string;
    finalMessage: string;
    tokensUsed?: number | null;
  })[];
}

export interface ListCommitHistoryVariables {
  repositoryId: UUIDString;
}

export interface Repository_Key {
  id: UUIDString;
  __typename?: 'Repository_Key';
}

export interface TeamPolicy_Key {
  id: UUIDString;
  __typename?: 'TeamPolicy_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateRepository' Mutation. Allow users to execute without passing in DataConnect. */
export function createRepository(dc: DataConnect, vars: CreateRepositoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateRepositoryData>>;
/** Generated Node Admin SDK operation action function for the 'CreateRepository' Mutation. Allow users to pass in custom DataConnect instances. */
export function createRepository(vars: CreateRepositoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateRepositoryData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCommitDraft' Mutation. Allow users to execute without passing in DataConnect. */
export function createCommitDraft(dc: DataConnect, vars: CreateCommitDraftVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCommitDraftData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCommitDraft' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCommitDraft(vars: CreateCommitDraftVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCommitDraftData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserRepositories' Query. Allow users to execute without passing in DataConnect. */
export function getUserRepositories(dc: DataConnect, vars: GetUserRepositoriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserRepositoriesData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserRepositories' Query. Allow users to pass in custom DataConnect instances. */
export function getUserRepositories(vars: GetUserRepositoriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserRepositoriesData>>;

/** Generated Node Admin SDK operation action function for the 'ListCommitHistory' Query. Allow users to execute without passing in DataConnect. */
export function listCommitHistory(dc: DataConnect, vars: ListCommitHistoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCommitHistoryData>>;
/** Generated Node Admin SDK operation action function for the 'ListCommitHistory' Query. Allow users to pass in custom DataConnect instances. */
export function listCommitHistory(vars: ListCommitHistoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCommitHistoryData>>;

