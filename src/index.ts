import React, { Ref, useContext } from 'react'
import {
  DataType,
  Command,
  Commands,
  Listener,
  Action,
  ActionType,
} from './types'

export function createStore<TState>() {
  type TStore = {
    currentState: TState
    stateListeners: Listener<TState>[]
    dispatch(action: Action): void
  }

  type TContext = { store: TStore }
  const Context = React.createContext<TContext>(null)

  function useStore() {
    return useContext(Context).store
  }

  function addCommands<TCommands extends Commands<TState>>(
    commands: TCommands
  ) {
    // Signature1
    function useCommand<K extends keyof TCommands>(
      type: K,
      data: DataType<TCommands[K]>
    ): () => void

    // Signature2
    function useCommand<TArgs extends any[]>(
      createAction: (...args: TArgs) => ActionType<TCommands>
    ): (...args: TArgs) => void

    // Implementation
    function useCommand(arg1: any, arg2?: any) {
      const store = useStore()

      if (arg2 != undefined) {
        const type = arg1
        const data = arg2
        return () => store.dispatch({ ...data, type })
      } else {
        const createAction = arg1
        return (...args: any) => {
          const action = createAction(...args)
          store.dispatch(action)
        }
      }
    }

    return { useCommand }
  }

  return { addCommands }
}
