import { Store, Action, Command, Listener, Unsubscribe } from './types'
import immer from 'immer'

export default function createStore<TState, TEvents>(initialState: TState) {
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
      store.stateListeners = store.stateListeners.filter((it) => it != listener)
    }
  }
}
