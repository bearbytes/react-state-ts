import React, { Ref, useContext, useState, useEffect, useRef } from 'react'
import {
  DataType,
  Command,
  Commands,
  Listener,
  Action,
  ActionType,
  Unsubscribe,
  Query,
} from './types'
import immer from 'immer'
import { Observable } from 'zen-observable-ts'

interface CreateStoreOptions<TState> {
  initialState?: TState
}

export function createStore<TState>(opts?: CreateStoreOptions<TState>) {
  type TStore = {
    state: TState
    stateListeners: Listener<TState>[]
    dispatch(action: Action): void
    subscribe(listener: Listener<TState>): Unsubscribe
  }
  const globalStore =
    opts && opts.initialState ? createStore(opts.initialState) : null

  const commands: { [type: string]: Command<TState, any> } = {}

  type TContext = { store: TStore | null }
  const Context = React.createContext<TContext>({ store: globalStore })

  return { addCommands, useQuery, StoreContainer }

  function query<TQueryResult>(query: Query<TState, TQueryResult>) {
    if (globalStore == null)
      throw 'Global Store does not exist. You need to pass initialState to createStore to use query'
    return query(globalStore.state)
  }

  // function observe<TQueryResult>(
  //   query: Query<TState, TQueryResult>
  // ): Observable<TQueryResult> {
  //   return new Observable(observer => {
  //     observer.next(query())
  //   })
  // }

  function addCommands<TCommands extends Commands<TState>>(
    addedCommands: TCommands
  ) {
    for (const type in addedCommands) {
      // TODO check for duplicates
      commands[type] = addedCommands[type]
    }

    return { useCommand }

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
        return (...args: any[]) => {
          const action = createAction(...args)
          store.dispatch(action)
        }
      }
    }
  }

  function useQuery<TQueryResult>(query: Query<TState, TQueryResult>) {
    const store = useStore()
    const [queryResult, setQueryResult] = useState(() => query(store.state))
    useEffect(() => store.subscribe((state) => setQueryResult(query(state))))
    return queryResult
  }

  function StoreContainer(props: { initialState: TState; children?: any }) {
    const storeRef = useRef<TStore>()
    if (storeRef.current == null) {
      storeRef.current = createStore(props.initialState)
    }
    return (
      <Context.Provider value={{ store: storeRef.current }}>
        {props.children}
      </Context.Provider>
    )
  }

  function useStore() {
    const { store } = useContext(Context)
    if (store == null)
      throw 'Did not find a store in current Context. Did you create a StoreContainer?'
    return store
  }

  function createStore(initialState: TState): TStore {
    const store: TStore = {
      state: initialState,
      stateListeners: [],
      dispatch,
      subscribe,
    }
    return store

    function dispatch(action: Action) {
      const command = commands[action.type]

      const oldState = store.state
      const newState = immer(oldState, (draft: TState) =>
        command(draft, action)
      )

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
