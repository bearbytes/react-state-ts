import { Commands, AddCommandsResult, Store, ActionType } from './types'

export default function<TState, TEvents>(
  useStore: () => Store<TState, TEvents>,
  globalStore: Store<TState, TEvents>
) {
  return function addCommands<TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ): AddCommandsResult<TCommands> {
    return {
      command,
      useCommand,
    }

    function command(action: ActionType<TCommands>): void {
      return globalStore.dispatch(action, commands[action.type])
    }

    function useCommand<TArgs extends any[]>(
      createAction: (...args: TArgs) => ActionType<TCommands>
    ) {
      const store = useStore()
      return (...args: TArgs) => {
        const action = createAction(...args)
        store.dispatch(action, commands[action.type])
      }
    }
  }
}
