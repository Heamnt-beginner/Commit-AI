import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

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

interface CreateRepositoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRepositoryVariables): MutationRef<CreateRepositoryData, CreateRepositoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRepositoryVariables): MutationRef<CreateRepositoryData, CreateRepositoryVariables>;
  operationName: string;
}
export const createRepositoryRef: CreateRepositoryRef;

export function createRepository(vars: CreateRepositoryVariables): MutationPromise<CreateRepositoryData, CreateRepositoryVariables>;
export function createRepository(dc: DataConnect, vars: CreateRepositoryVariables): MutationPromise<CreateRepositoryData, CreateRepositoryVariables>;

interface CreateCommitDraftRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCommitDraftVariables): MutationRef<CreateCommitDraftData, CreateCommitDraftVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCommitDraftVariables): MutationRef<CreateCommitDraftData, CreateCommitDraftVariables>;
  operationName: string;
}
export const createCommitDraftRef: CreateCommitDraftRef;

export function createCommitDraft(vars: CreateCommitDraftVariables): MutationPromise<CreateCommitDraftData, CreateCommitDraftVariables>;
export function createCommitDraft(dc: DataConnect, vars: CreateCommitDraftVariables): MutationPromise<CreateCommitDraftData, CreateCommitDraftVariables>;

interface GetUserRepositoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserRepositoriesVariables): QueryRef<GetUserRepositoriesData, GetUserRepositoriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserRepositoriesVariables): QueryRef<GetUserRepositoriesData, GetUserRepositoriesVariables>;
  operationName: string;
}
export const getUserRepositoriesRef: GetUserRepositoriesRef;

export function getUserRepositories(vars: GetUserRepositoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRepositoriesData, GetUserRepositoriesVariables>;
export function getUserRepositories(dc: DataConnect, vars: GetUserRepositoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRepositoriesData, GetUserRepositoriesVariables>;

interface ListCommitHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCommitHistoryVariables): QueryRef<ListCommitHistoryData, ListCommitHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListCommitHistoryVariables): QueryRef<ListCommitHistoryData, ListCommitHistoryVariables>;
  operationName: string;
}
export const listCommitHistoryRef: ListCommitHistoryRef;

export function listCommitHistory(vars: ListCommitHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListCommitHistoryData, ListCommitHistoryVariables>;
export function listCommitHistory(dc: DataConnect, vars: ListCommitHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListCommitHistoryData, ListCommitHistoryVariables>;

