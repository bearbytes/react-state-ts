import { CreateStoreOptions, CreateStoreResult } from './types'
import addCommands from './addCommands'
import createStore from './createStore'
import addReactContext from './addReactContext'

export function createFromState<TState, TEvents = {}>(
  opts: CreateStoreOptions<TState, TEvents>
): CreateStoreResult<TState, TEvents> {
  const store = createStore<TState, TEvents>(opts.initialState!)

  const { useStore, useSelection, StoreContainer } = addReactContext<
    TState,
    TEvents
  >(store)

  return {
    store,
    useSelection,
    StoreContainer,
    addCommands: addCommands<TState, TEvents>(useStore, store),
  }
}
