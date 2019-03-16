export interface CreateStoreOptions<TState> {
  initialState?: TState
}

export interface CreateStoreResult<TState> {
  addCommands<TCommands extends Commands<TState>>(
    commands: TCommands
  ): AddCommandsResult<TCommands>

  useQuery<TQueryResult>(query: Query<TState, TQueryResult>): TQueryResult

  StoreContainer: React.ComponentType<StoreContainerProps<TState>>
}

export interface AddCommandsResult<TCommands> {
  useCommand: UseCommand<TCommands>
}

export interface UseCommand<TCommands> {
  <K extends keyof TCommands>(type: K, data: DataType<TCommands[K]>): () => void
  <TArgs extends any[]>(
    createAction: (...args: TArgs) => ActionType<TCommands>
  ): (...args: TArgs) => void
}

export interface StoreContainerProps<TState> {
  initialState: TState
  children?: any
}

export interface Store<TState> {
  state: TState
  stateListeners: Listener<TState>[]
  dispatch(action: Action): void
  subscribe(listener: Listener<TState>): Unsubscribe
}

export type Action = { type: string }

export type Command<TState, TData> = (state: TState, data: TData) => void
export type Commands<TState> = { [commandType: string]: Command<TState, any> }

export type ActionType<TCommands> = ActionTypes<TCommands>[keyof TCommands]
export type ActionTypes<TCommands> = {
  [K in keyof TCommands]: { type: K } & DataType<TCommands[K]>
}
export type DataType<TCommand> = TCommand extends Command<any, infer TData>
  ? TData
  : {}

export type Listener<TState> = (newState: TState, oldState: TState) => void
export type Unsubscribe = () => void

export type Query<TState, TQueryResult> = (state: TState) => TQueryResult
