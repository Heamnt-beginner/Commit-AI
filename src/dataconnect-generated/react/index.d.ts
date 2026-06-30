import { CreateRepositoryData, CreateRepositoryVariables, CreateCommitDraftData, CreateCommitDraftVariables, GetUserRepositoriesData, GetUserRepositoriesVariables, ListCommitHistoryData, ListCommitHistoryVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateRepository(options?: useDataConnectMutationOptions<CreateRepositoryData, FirebaseError, CreateRepositoryVariables>): UseDataConnectMutationResult<CreateRepositoryData, CreateRepositoryVariables>;
export function useCreateRepository(dc: DataConnect, options?: useDataConnectMutationOptions<CreateRepositoryData, FirebaseError, CreateRepositoryVariables>): UseDataConnectMutationResult<CreateRepositoryData, CreateRepositoryVariables>;

export function useCreateCommitDraft(options?: useDataConnectMutationOptions<CreateCommitDraftData, FirebaseError, CreateCommitDraftVariables>): UseDataConnectMutationResult<CreateCommitDraftData, CreateCommitDraftVariables>;
export function useCreateCommitDraft(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCommitDraftData, FirebaseError, CreateCommitDraftVariables>): UseDataConnectMutationResult<CreateCommitDraftData, CreateCommitDraftVariables>;

export function useGetUserRepositories(vars: GetUserRepositoriesVariables, options?: useDataConnectQueryOptions<GetUserRepositoriesData>): UseDataConnectQueryResult<GetUserRepositoriesData, GetUserRepositoriesVariables>;
export function useGetUserRepositories(dc: DataConnect, vars: GetUserRepositoriesVariables, options?: useDataConnectQueryOptions<GetUserRepositoriesData>): UseDataConnectQueryResult<GetUserRepositoriesData, GetUserRepositoriesVariables>;

export function useListCommitHistory(vars: ListCommitHistoryVariables, options?: useDataConnectQueryOptions<ListCommitHistoryData>): UseDataConnectQueryResult<ListCommitHistoryData, ListCommitHistoryVariables>;
export function useListCommitHistory(dc: DataConnect, vars: ListCommitHistoryVariables, options?: useDataConnectQueryOptions<ListCommitHistoryData>): UseDataConnectQueryResult<ListCommitHistoryData, ListCommitHistoryVariables>;
