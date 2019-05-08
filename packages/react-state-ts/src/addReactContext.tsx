import React, { useContext, useState, useEffect } from 'react'
import { Select, StoreContainerProps, Store } from './types'
import createStore from './createStore'
import { map } from 'rxjs/operators'

export default function addReactContext<TState, TEvents>(
  globalStore: Store<TState, TEvents>
) {
  const Context = React.createContext({ store: globalStore })

  function useStore(): Store<TState, TEvents> {
    const { store } = useContext(Context)
    if (store == null)
      throw 'Did not find a store in current Context. Did you create a StoreContainer?'
    return store
  }

  function useSelection<TSelection>(
    select: Select<TState, TSelection>
  ): TSelection {
    const store = useStore()

    const [selection, setSelection] = useState(() => select(store.state.value))

    useEffect(() => {
      const subscription = store.state.pipe(map(select)).subscribe(setSelection)
      return () => subscription.unsubscribe()
    })

    return selection
  }

  function StoreContainer(props: StoreContainerProps<TState>) {
    const [store] = useState(() =>
      createStore<TState, TEvents>(props.initialState)
    )

    return (
      <Context.Provider value={{ store }}>{props.children}</Context.Provider>
    )
  }

  return { useStore, useSelection, StoreContainer }
}
