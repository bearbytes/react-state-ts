export interface CreateStoreOptions<TState, TEvents> {
  initialState?: TState
}

export interface CreateStoreResult<TState, TEvents> {
  query?: Query<TState>
  subscribe?: Subscribe<TState>
  useQuery: UseQuery<TState>
  addCommands: AddCommands<TState, TEvents>
  StoreContainer: React.ComponentType<StoreContainerProps<TState>>
}

export interface AddCommands<TState, TEvents> {
  <TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ): AddCommandsResult<TCommands>
}

export interface AddCommandsResult<TCommands> {
  useCommand: ExecCommand<TCommands>
  command?: ExecCommand<TCommands>
}

export interface Query<TState> {
  <TSelection>(select: Select<TState, TSelection>): TSelection
}

export interface Subscribe<TState> {
  <TSelection>(
    select: Select<TState, TSelection>,
    listener: Listener<TSelection>
  ): Unsubscribe
}

export interface UseQuery<TState> {
  <TSelection>(select: Select<TState, TSelection>): TSelection
}

export type ExecCommand1<TCommands> = <K extends keyof TCommands>(
  type: K,
  data: DataType<TCommands[K]>
) => () => void

export type ExecCommand2<TCommands> = <TArgs extends any[]>(
  createAction: (...args: TArgs) => ActionType<TCommands>
) => (...args: TArgs) => void

export interface ExecCommand<TCommands>
  extends ExecCommand1<TCommands>,
    ExecCommand2<TCommands> {}

export interface StoreContainerProps<TState> {
  initialState: TState
  children?: any
}

export interface Store<TState, TEvents> {
  state: TState
  stateListeners: Listener<TState>[]
  dispatch<TData>(
    action: Action<TData>,
    implementation: Command<TState, TEvents, TData>
  ): void
  subscribe(listener: Listener<TState>): Unsubscribe
}

export type Action<TData> = { type: string; data: TData }

export type Command<TState, TEvents, TData> = (
  state: TState,
  data: TData
) => void | EventType<TEvents> | EventType<TEvents>[]
export type Commands<TState, TEvents> = {
  [commandType: string]: Command<TState, TEvents, any>
}

export type EventType<TEvents> = EventTypes<TEvents>[keyof TEvents]
export type EventTypes<TEvents> = {
  [K in keyof TEvents]: { type: K } & TEvents[K]
}

export type ActionType<TCommands> = ActionTypes<TCommands>[keyof TCommands]
export type ActionTypes<TCommands> = {
  [K in keyof TCommands]: { type: K } & DataType<TCommands[K]>
}
export type DataType<TCommand> = TCommand extends Command<any, any, infer TData>
  ? TData
  : {}

export type Listener<TState> = (newState: TState, oldState?: TState) => void
export type Unsubscribe = () => void

export type Select<TState, TSelection> = (state: TState) => TSelection
