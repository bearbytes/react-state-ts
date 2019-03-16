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
  const Context = React.createContext<TContext>(null)

  const commands: { [type: string]: Command<TState, any> } = {}

  return { addCommands, useSelection, StateContainer }

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
        return (...args: any) => {
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

  function StateContainer(props: { initialState: TState; children?: any }) {
    const store = useRef<TStore>()

    if (store.current == null) {
      store.current = {
        state: props.initialState,
        stateListeners: [],
        dispatch,
        subscribe,
      }
    }

    return (
      <Context.Provider value={{ store: store.current }}>
        {props.children}
      </Context.Provider>
    )

    function dispatch(action: Action) {
      const command = commands[action.type]

      const oldState = store.current.state
      const newState = immer(oldState, (draft: TState) =>
        command(draft, action)
      )

      store.current.state = newState
      for (const listener of store.current.stateListeners) {
        listener(newState, oldState)
      }
    }

    function subscribe(listener: Listener<TState>): Unsubscribe {
      store.current.stateListeners.push(listener)
      return () => {
        store.current.stateListeners = store.current.stateListeners.filter(
          (it) => it != listener
        )
      }
    }
  }

  function useStore() {
    return useContext(Context).store
  }
}
