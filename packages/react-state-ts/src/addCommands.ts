import {
  Commands,
  AddCommandsResult,
  Store,
  ExecCommand,
  ExecCommand1,
} from './types'

export default function<TState, TEvents>(
  useStore: () => Store<TState, TEvents>,
  globalStore?: Store<TState, TEvents>
) {
  return function addCommand<TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ): AddCommandsResult<TCommands> {
    return {
      command: globalStore ? execCommand(globalStore) : undefined,
      useCommand,
    }

    function useCommand(arg1: any, arg2?: any) {
      const createAction = typeof arg1 == 'function' ? arg1 : undefined
      const type = createAction == undefined ? arg1 : undefined
      const data = arg2

      const store = useStore()
      if (createAction) {
        return (...args: any[]) => {
          const action = createAction(...args)
          store.dispatch(action, commands[action.type])
        }
      } else {
        const action = { type, data }
        return () => store.dispatch(action, commands[type])
      }
    }

    function execCommand(
      store: Store<TState, TEvents>
    ): ExecCommand<TCommands> {
      return function(arg1: any, arg2?: any) {
        if (arg2 != undefined) {
          // overload 1
          const type = arg1
          const data = arg2
          const action = { type, data }
          return () => store.dispatch(action, commands[type])
        } else {
          // overload 2
          const createAction = arg1
          return (...args: any[]) => {
            const action = createAction(...args)
            store.dispatch(action, commands[action.type])
          }
        }
      }
    }
  }
}
