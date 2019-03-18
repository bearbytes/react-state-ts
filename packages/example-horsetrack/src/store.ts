import { createStore, defineCommands } from 'react-state-ts'
import { AppState, RacingHorse } from './types'

const initialState: AppState = {
  horses: [],
  progress: {},
  isRunning: false,
}

interface Events {
  started: {}
  stopped: {}
  addedHorse: { horse: RacingHorse }
}

export const { StoreContainer, useQuery, addCommands } = createStore<
  AppState,
  Events
>({ initialState })

export const { command, useCommand } = addCommands({
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
})
