import { createStore } from 'react-state-ts'
import { AppState, RacingHorse } from './types'
import { Commands } from 'react-state-ts/dist/types'

interface Events {
  started: {}
  stopped: {}
  addedHorse: { horse: RacingHorse }
}

const commands: Commands<AppState, Events> = {
  start: (s) => {
    s.isRunning = true
    return { type: 'started' }
  },

  stop: (s) => {
    s.isRunning = false
    return { type: 'stopped' }
  },

  moveForward: (s, data: { horseName: string; moveBy: number }) => {
    s.progress[data.horseName] += data.moveBy
  },

  addHorse: (s, data: { horse: RacingHorse }) => {
    s.horses.push(data.horse)
    s.progress[data.horse.name] = 0
    return {
      type: 'addedHorse',
      horse: data.horse,
    }
  },
}

export const { useQuery, useCommand, StoreContainer } = createStore<
  AppState,
  Events,
  typeof commands
>({ commands })
