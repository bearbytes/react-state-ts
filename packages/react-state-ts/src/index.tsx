import React, { Ref, useContext, useState, useEffect, useRef } from 'react'
import {
  DataType,
  Command,
  Commands,
  Listener,
  Action,
  ActionType,
  Unsubscribe,
} from './types'
import immer from 'immer'

export function createStore<TState>() {
  type TStore = {
    state: TState
    stateListeners: Listener<TState>[]
    dispatch(action: Action): void
    subscribe(listener: Listener<TState>): Unsubscribe
  }

  type TContext = { store: TStore }
  const Context = React.createContext<TContext>(null as any)

  const commands: { [type: string]: Command<TState, any> } = {}

  return { addCommands, useSelection, StoreContainer }

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

  function useSelection<TSelection>(select: (state: TState) => TSelection) {
    const store = useStore()
    const [selection, setSelection] = useState(() => select(store.state))
    useEffect(() => store.subscribe((state) => setSelection(select(state))))
    return selection
  }

  function StoreContainer(props: { initialState: TState; children?: any }) {
    const storeRef = useRef<TStore>()
    if (storeRef.current == null) {
      storeRef.current = {
        state: props.initialState,
        stateListeners: [],
        dispatch,
        subscribe,
      }
    }
    const store = storeRef.current!

    return (
      <Context.Provider value={{ store: storeRef.current }}>
        {props.children}
      </Context.Provider>
    )

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

  function useStore() {
    const { store } = useContext(Context)
    if (store == null)
      throw 'Did not find a store in current Context. Did you create a StoreContainer?'
    return store
  }
}
