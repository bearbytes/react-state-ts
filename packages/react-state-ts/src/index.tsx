import React, { useContext, useState, useEffect } from 'react'
import {
  Commands,
  Listener,
  Action,
  Unsubscribe,
  Select,
  CreateStoreOptions,
  CreateStoreResult,
  StoreContainerProps,
  Store,
  AddCommands,
  AddCommandsResult,
  ExecCommand,
  Command,
} from './types'
import immer from 'immer'

export function defineCommands<TState, TEvents>() {
  return function<TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ) {
    return commands
  }
}

export function createStore<TState, TEvents = {}>(
  opts: CreateStoreOptions<TState, TEvents>
): CreateStoreResult<TState, TEvents> {
  const globalStore = opts.initialState ? createStore(opts.initialState) : null

  const query = globalStore
    ? function<TQueryResult>(query: Select<TState, TQueryResult>) {
        return query(globalStore.state)
      }
    : undefined

  const subscribe = globalStore
    ? function<TQueryResult>(
        query: Select<TState, TQueryResult>,
        listener: Listener<TQueryResult>
      ) {
        return globalStore.subscribe((newState, oldState) =>
          listener(query(newState), oldState && query(oldState))
        )
      }
    : undefined

  const Context = React.createContext({ store: globalStore })

  return { query, subscribe, useQuery, addCommands, StoreContainer }

  function addCommands<TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ): AddCommandsResult<TCommands> {
    return {
      command: globalStore ? execCommand(globalStore) : undefined,
      useCommand: execCommand(),
    }

    function execCommand(
      store: Store<TState, TEvents> = useStore()
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

  function useQuery<TQueryResult>(query: Select<TState, TQueryResult>) {
    const store = useStore()
    const [queryResult, setQueryResult] = useState(() => query(store.state))
    useEffect(() => store.subscribe((state) => setQueryResult(query(state))))
    return queryResult
  }

  function StoreContainer(props: StoreContainerProps<TState>) {
    const [store] = useState(() => createStore(props.initialState))
    return (
      <Context.Provider value={{ store }}>{props.children}</Context.Provider>
    )
  }

  function useStore() {
    const { store } = useContext(Context)
    if (store == null)
      throw 'Did not find a store in current Context. Did you create a StoreContainer?'
    return store
  }

  function createStore(initialState: TState) {
    const store: Store<TState, TEvents> = {
      state: initialState,
      stateListeners: [],
      dispatch,
      subscribe,
    }
    return store

    function dispatch<TData>(
      action: Action<TData>,
      command: Command<TState, TEvents, TData>
    ) {
      const oldState = store.state
      const newState = immer(oldState, (draft: TState) => {
        const commandResult = command(draft, action.data)
        // TODO trigger events from commandResult
      })

      store.state = newState
      for (const listener of store.stateListeners) {
        listener(newState, oldState)
      }
    }

    function subscribe(listener: Listener<TState>): Unsubscribe {
      store.stateListeners.push(listener)
      return () => {
        store.stateListeners = store.stateListeners.filter(
          (it) => it != listener
        )
      }
    }
  }
}
