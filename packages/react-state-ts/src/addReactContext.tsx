import React, { useContext, useState, useEffect } from 'react'
import { Select, StoreContainerProps, Store } from './types'
import createStore from './createStore'

export default function addReactContext<TState, TEvents>(
  globalStore?: Store<TState, TEvents>
) {
  const Context = React.createContext({ store: globalStore })

  function useStore(): Store<TState, TEvents> {
    const { store } = useContext(Context)
    if (store == null)
      throw 'Did not find a store in current Context. Did you create a StoreContainer?'
    return store
  }

  function useQuery<TQueryResult>(query: Select<TState, TQueryResult>) {
    const store = useStore()
    const [queryResult, setQueryResult] = useState(() => query(store.state))
    useEffect(() => store.subscribe((state) => setQueryResult(query(state))))
    return queryResult
  }

  function StoreContainer(props: StoreContainerProps<TState>) {
    const [store] = useState(() =>
      createStore<TState, TEvents>(props.initialState)
    )
    return (
      <Context.Provider value={{ store }}>{props.children}</Context.Provider>
    )
  }

  return { useStore, useQuery, StoreContainer }
}
