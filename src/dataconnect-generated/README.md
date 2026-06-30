# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserRepositories*](#getuserrepositories)
  - [*ListCommitHistory*](#listcommithistory)
- [**Mutations**](#mutations)
  - [*CreateRepository*](#createrepository)
  - [*CreateCommitDraft*](#createcommitdraft)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserRepositories
You can execute the `GetUserRepositories` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserRepositories(vars: GetUserRepositoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRepositoriesData, GetUserRepositoriesVariables>;

interface GetUserRepositoriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserRepositoriesVariables): QueryRef<GetUserRepositoriesData, GetUserRepositoriesVariables>;
}
export const getUserRepositoriesRef: GetUserRepositoriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserRepositories(dc: DataConnect, vars: GetUserRepositoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserRepositoriesData, GetUserRepositoriesVariables>;

interface GetUserRepositoriesRef {
  ...
  (dc: DataConnect, vars: GetUserRepositoriesVariables): QueryRef<GetUserRepositoriesData, GetUserRepositoriesVariables>;
}
export const getUserRepositoriesRef: GetUserRepositoriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRepositoriesRef:
```typescript
const name = getUserRepositoriesRef.operationName;
console.log(name);
```

### Variables
The `GetUserRepositories` query requires an argument of type `GetUserRepositoriesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserRepositoriesVariables {
  ownerId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserRepositories` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserRepositoriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserRepositoriesData {
  repositories: ({
    id: UUIDString;
    name: string;
    remoteUrl: string;
  } & Repository_Key)[];
}
```
### Using `GetUserRepositories`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserRepositories, GetUserRepositoriesVariables } from '@dataconnect/generated';

// The `GetUserRepositories` query requires an argument of type `GetUserRepositoriesVariables`:
const getUserRepositoriesVars: GetUserRepositoriesVariables = {
  ownerId: ..., 
};

// Call the `getUserRepositories()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserRepositories(getUserRepositoriesVars);
// Variables can be defined inline as well.
const { data } = await getUserRepositories({ ownerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserRepositories(dataConnect, getUserRepositoriesVars);

console.log(data.repositories);

// Or, you can use the `Promise` API.
getUserRepositories(getUserRepositoriesVars).then((response) => {
  const data = response.data;
  console.log(data.repositories);
});
```

### Using `GetUserRepositories`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRepositoriesRef, GetUserRepositoriesVariables } from '@dataconnect/generated';

// The `GetUserRepositories` query requires an argument of type `GetUserRepositoriesVariables`:
const getUserRepositoriesVars: GetUserRepositoriesVariables = {
  ownerId: ..., 
};

// Call the `getUserRepositoriesRef()` function to get a reference to the query.
const ref = getUserRepositoriesRef(getUserRepositoriesVars);
// Variables can be defined inline as well.
const ref = getUserRepositoriesRef({ ownerId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRepositoriesRef(dataConnect, getUserRepositoriesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.repositories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.repositories);
});
```

## ListCommitHistory
You can execute the `ListCommitHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCommitHistory(vars: ListCommitHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListCommitHistoryData, ListCommitHistoryVariables>;

interface ListCommitHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCommitHistoryVariables): QueryRef<ListCommitHistoryData, ListCommitHistoryVariables>;
}
export const listCommitHistoryRef: ListCommitHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCommitHistory(dc: DataConnect, vars: ListCommitHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListCommitHistoryData, ListCommitHistoryVariables>;

interface ListCommitHistoryRef {
  ...
  (dc: DataConnect, vars: ListCommitHistoryVariables): QueryRef<ListCommitHistoryData, ListCommitHistoryVariables>;
}
export const listCommitHistoryRef: ListCommitHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCommitHistoryRef:
```typescript
const name = listCommitHistoryRef.operationName;
console.log(name);
```

### Variables
The `ListCommitHistory` query requires an argument of type `ListCommitHistoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListCommitHistoryVariables {
  repositoryId: UUIDString;
}
```
### Return Type
Recall that executing the `ListCommitHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCommitHistoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCommitHistoryData {
  commitHistories: ({
    commitHash: string;
    finalMessage: string;
    tokensUsed?: number | null;
  })[];
}
```
### Using `ListCommitHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCommitHistory, ListCommitHistoryVariables } from '@dataconnect/generated';

// The `ListCommitHistory` query requires an argument of type `ListCommitHistoryVariables`:
const listCommitHistoryVars: ListCommitHistoryVariables = {
  repositoryId: ..., 
};

// Call the `listCommitHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCommitHistory(listCommitHistoryVars);
// Variables can be defined inline as well.
const { data } = await listCommitHistory({ repositoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCommitHistory(dataConnect, listCommitHistoryVars);

console.log(data.commitHistories);

// Or, you can use the `Promise` API.
listCommitHistory(listCommitHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.commitHistories);
});
```

### Using `ListCommitHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCommitHistoryRef, ListCommitHistoryVariables } from '@dataconnect/generated';

// The `ListCommitHistory` query requires an argument of type `ListCommitHistoryVariables`:
const listCommitHistoryVars: ListCommitHistoryVariables = {
  repositoryId: ..., 
};

// Call the `listCommitHistoryRef()` function to get a reference to the query.
const ref = listCommitHistoryRef(listCommitHistoryVars);
// Variables can be defined inline as well.
const ref = listCommitHistoryRef({ repositoryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCommitHistoryRef(dataConnect, listCommitHistoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.commitHistories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.commitHistories);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateRepository
You can execute the `CreateRepository` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRepository(vars: CreateRepositoryVariables): MutationPromise<CreateRepositoryData, CreateRepositoryVariables>;

interface CreateRepositoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRepositoryVariables): MutationRef<CreateRepositoryData, CreateRepositoryVariables>;
}
export const createRepositoryRef: CreateRepositoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRepository(dc: DataConnect, vars: CreateRepositoryVariables): MutationPromise<CreateRepositoryData, CreateRepositoryVariables>;

interface CreateRepositoryRef {
  ...
  (dc: DataConnect, vars: CreateRepositoryVariables): MutationRef<CreateRepositoryData, CreateRepositoryVariables>;
}
export const createRepositoryRef: CreateRepositoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRepositoryRef:
```typescript
const name = createRepositoryRef.operationName;
console.log(name);
```

### Variables
The `CreateRepository` mutation requires an argument of type `CreateRepositoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRepositoryVariables {
  name: string;
  remoteUrl: string;
  ownerId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateRepository` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRepositoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRepositoryData {
  repository_insert: Repository_Key;
}
```
### Using `CreateRepository`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRepository, CreateRepositoryVariables } from '@dataconnect/generated';

// The `CreateRepository` mutation requires an argument of type `CreateRepositoryVariables`:
const createRepositoryVars: CreateRepositoryVariables = {
  name: ..., 
  remoteUrl: ..., 
  ownerId: ..., 
};

// Call the `createRepository()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRepository(createRepositoryVars);
// Variables can be defined inline as well.
const { data } = await createRepository({ name: ..., remoteUrl: ..., ownerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRepository(dataConnect, createRepositoryVars);

console.log(data.repository_insert);

// Or, you can use the `Promise` API.
createRepository(createRepositoryVars).then((response) => {
  const data = response.data;
  console.log(data.repository_insert);
});
```

### Using `CreateRepository`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRepositoryRef, CreateRepositoryVariables } from '@dataconnect/generated';

// The `CreateRepository` mutation requires an argument of type `CreateRepositoryVariables`:
const createRepositoryVars: CreateRepositoryVariables = {
  name: ..., 
  remoteUrl: ..., 
  ownerId: ..., 
};

// Call the `createRepositoryRef()` function to get a reference to the mutation.
const ref = createRepositoryRef(createRepositoryVars);
// Variables can be defined inline as well.
const ref = createRepositoryRef({ name: ..., remoteUrl: ..., ownerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRepositoryRef(dataConnect, createRepositoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.repository_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.repository_insert);
});
```

## CreateCommitDraft
You can execute the `CreateCommitDraft` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCommitDraft(vars: CreateCommitDraftVariables): MutationPromise<CreateCommitDraftData, CreateCommitDraftVariables>;

interface CreateCommitDraftRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCommitDraftVariables): MutationRef<CreateCommitDraftData, CreateCommitDraftVariables>;
}
export const createCommitDraftRef: CreateCommitDraftRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCommitDraft(dc: DataConnect, vars: CreateCommitDraftVariables): MutationPromise<CreateCommitDraftData, CreateCommitDraftVariables>;

interface CreateCommitDraftRef {
  ...
  (dc: DataConnect, vars: CreateCommitDraftVariables): MutationRef<CreateCommitDraftData, CreateCommitDraftVariables>;
}
export const createCommitDraftRef: CreateCommitDraftRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCommitDraftRef:
```typescript
const name = createCommitDraftRef.operationName;
console.log(name);
```

### Variables
The `CreateCommitDraft` mutation requires an argument of type `CreateCommitDraftVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCommitDraftVariables {
  diffContent: string;
  status: string;
  repositoryId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateCommitDraft` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCommitDraftData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCommitDraftData {
  commitDraft_insert: CommitDraft_Key;
}
```
### Using `CreateCommitDraft`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCommitDraft, CreateCommitDraftVariables } from '@dataconnect/generated';

// The `CreateCommitDraft` mutation requires an argument of type `CreateCommitDraftVariables`:
const createCommitDraftVars: CreateCommitDraftVariables = {
  diffContent: ..., 
  status: ..., 
  repositoryId: ..., 
};

// Call the `createCommitDraft()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCommitDraft(createCommitDraftVars);
// Variables can be defined inline as well.
const { data } = await createCommitDraft({ diffContent: ..., status: ..., repositoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCommitDraft(dataConnect, createCommitDraftVars);

console.log(data.commitDraft_insert);

// Or, you can use the `Promise` API.
createCommitDraft(createCommitDraftVars).then((response) => {
  const data = response.data;
  console.log(data.commitDraft_insert);
});
```

### Using `CreateCommitDraft`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCommitDraftRef, CreateCommitDraftVariables } from '@dataconnect/generated';

// The `CreateCommitDraft` mutation requires an argument of type `CreateCommitDraftVariables`:
const createCommitDraftVars: CreateCommitDraftVariables = {
  diffContent: ..., 
  status: ..., 
  repositoryId: ..., 
};

// Call the `createCommitDraftRef()` function to get a reference to the mutation.
const ref = createCommitDraftRef(createCommitDraftVars);
// Variables can be defined inline as well.
const ref = createCommitDraftRef({ diffContent: ..., status: ..., repositoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCommitDraftRef(dataConnect, createCommitDraftVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.commitDraft_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.commitDraft_insert);
});
```

