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
    function useCommand<K extends keyof TCommands>(
      type: K,
      data: DataType<TCommands[K]>
    ) {
      const store = useStore()
      store.dispatch({ ...data, type })
    }

    function useCommand2<TArgs extends any[]>(
      createAction: (...args: TArgs) => ActionType<TCommands>
    ) {
      const store = useStore()
      return function(...args: TArgs) {
        const action = createAction(...args)
        store.dispatch(action)
      }
    }

    return { useCommand, useCommand2 }
  }

  return { addCommands }
}
