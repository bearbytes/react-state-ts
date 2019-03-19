import {
  Commands,
  Listener,
  Select,
  CreateStoreOptions,
  CreateStoreResult,
} from './types'
import addCommands from './addCommands'
import createStore from './createStore'
import addReactContext from './addReactContext'

export function createFromState<TState, TEvents = {}>(
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

  const { useStore, useQuery, StoreContainer } = addReactContext<
    TState,
    TEvents
  >(globalStore)

  return {
    query,
    subscribe,
    useQuery,
    addCommands: addCommands<TState, TEvents>(useStore, globalStore),
    StoreContainer,
  }
}
