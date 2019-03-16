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
