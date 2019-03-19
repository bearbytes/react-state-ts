import React, { useContext, useState, useEffect } from 'react'
import {
  Commands,
  Listener,
  Select,
  CreateStoreOptions,
  CreateStoreResult,
  StoreContainerProps,
  Store,
} from './types'
import addCommands from './addCommands'
import createStore from './createStore'

export function defineCommands<TState, TEvents>() {
  return function<TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ) {
    return commands
  }
}

export function create<TState, TEvents = {}>(
  opts: CreateStoreOptions<TState, TEvents>
): CreateStoreResult<TState, TEvents> {
  const globalStore = opts.initialState
    ? createStore<TState, TEvents>(opts.initialState)
    : undefined

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

  return {
    query,
    subscribe,
    useQuery,
    addCommands: addCommands<TState, TEvents>(useStore, globalStore),
    StoreContainer,
  }

  function useQuery<TQueryResult>(query: Select<TState, TQueryResult>) {
    const store = useStore()
    const [queryResult, setQueryResult] = useState(() => query(store.state))
    useEffect(() => store.subscribe((state) => setQueryResult(query(state))))
    return queryResult
  }

  function StoreContainer(props: StoreContainerProps<TState>) {
    const [store] = useState(() =>
      createStore<TState, TEvents>(props.initialState)
    )
    return (
      <Context.Provider value={{ store }}>{props.children}</Context.Provider>
    )
  }

  function useStore(): Store<TState, TEvents> {
    const { store } = useContext(Context)
    if (store == null)
      throw 'Did not find a store in current Context. Did you create a StoreContainer?'
    return store
  }
}
