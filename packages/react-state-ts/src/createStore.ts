import { Store, Action, Command, EventType } from './types'
import immer from 'immer'
import { BehaviorSubject, Subject } from 'rxjs'
import { devToolsEnhancer } from 'redux-devtools-extension'

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

    const newState = immer(oldState, (draft: TState) => {
      const commandResult = command(draft, action)

      if (Array.isArray(commandResult)) {
        for (const event of commandResult) {
          events.next(event)
        }
      } else if (typeof commandResult == 'object') {
        events.next(commandResult)
      }
    })

    if (devTools) {
      devTools.send(action, newState)
    }

    store.state.next(newState)
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
