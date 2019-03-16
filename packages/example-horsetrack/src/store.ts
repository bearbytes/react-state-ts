import { createStore } from 'react-state-ts'
import { AppState } from './types'

export const { addCommands, useSelection, StoreContainer } = createStore<
  AppState
>()
