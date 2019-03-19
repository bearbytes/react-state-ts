import { Store, Action, Command, EventType } from './types'
import immer from 'immer'
import { BehaviorSubject, Subject } from 'rxjs'

export default function createStore<TState, TEvents>(
  initialState: TState
): Store<TState, TEvents> {
  const state = new BehaviorSubject(initialState)
  const events = new Subject<EventType<TEvents>>()

  const store: Store<TState, TEvents> = {
    state,
    events,
    dispatch,
  }

  function dispatch<TData>(
    action: Action<TData>,
    command: Command<TState, TEvents, TData>
  ) {
    const oldState = store.state.value

    const newState = immer(oldState, (draft: TState) => {
      const commandResult = command(draft, action)
      // TODO trigger events from commandResult
    })

    store.state.next(newState)
  }

  return store
}
