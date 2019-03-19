import { Store, Action, Command, Listener, Unsubscribe, Select } from './types'
import immer from 'immer'

export default function createStore<TState, TEvents>(initialState: TState) {
  const store: Store<TState, TEvents> = {
    state: initialState,

    stateListeners: [],

    query,
    subscribe,

    dispatch,
  }

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

  function query<TSelection>(select: Select<TState, TSelection>) {
    return select(store.state)
  }

  function subscribe(listener: Listener<TState>): Unsubscribe
  function subscribe<TSelection>(
    select: Select<TState, TSelection>,
    listener: Listener<TSelection>
  ): Unsubscribe
  function subscribe(arg1: any, arg2?: any) {
    const listener = arg2 ? arg2 : arg1
    const select = arg2 ? arg1 : undefined

    store.stateListeners.push(listener)
    function unsubscribe() {
      store.stateListeners = store.stateListeners.filter((it) => it != listener)
    }

    if (select) {
      return store.subscribe((newState, oldState) =>
        listener(select(newState), oldState && select(oldState))
      )
    } else {
      return store
      return unsubscribe
    }
  }

  return store
}
