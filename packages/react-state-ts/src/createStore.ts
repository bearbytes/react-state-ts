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

  const devTools = installDevTools(store)

  function dispatch<TData>(
    action: Action<TData>,
    command: Command<TState, TEvents, TData>
  ) {
    const oldState = store.state.value

    let emittedEvents: EventType<TEvents>[] = []

    const newState = immer(oldState, (draft: TState) => {
      const commandResult = command(draft, action)
      if (Array.isArray(commandResult)) {
        commandResult.forEach((event) => emittedEvents.push(deepClone(event)))
      } else if (typeof commandResult == 'object') {
        emittedEvents.push(deepClone(commandResult))
      }
    })

    store.state.next(newState)
    emittedEvents.forEach((event) => {
      events.next(event)
    })

    if (devTools) {
      devTools.send({ ...action, type: 'command: ' + action.type }, newState)
      emittedEvents.forEach((event) => {
        devTools.send({ ...event, type: 'event: ' + event.type }, newState)
      })
    }
  }

  return store
}

function installDevTools(store: Store<any, any>) {
  const w = window as any
  if (!w) return

  const ext = w.__REDUX_DEVTOOLS_EXTENSION__
  if (!ext) return

  const devTools = ext.connect({})

  devTools.init(store.state.value)

  return devTools
}

function deepClone(X: any): any {
  if (Array.isArray(X)) {
    const clone: any[] = []
    for (const item of X) {
      clone.push(deepClone(item))
    }
    return clone
  }
  if (typeof X == 'object') {
    const clone: Record<string, any> = {}
    for (const key of Object.keys(X)) {
      clone[key] = deepClone(X[key])
    }
    return clone
  }
  return X
}
