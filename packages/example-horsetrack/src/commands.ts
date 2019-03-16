import { createStore } from 'react-state-ts'
import { AppState, RacingHorse } from './types'

const { StoreContainer, addCommands, useSelection } = createStore<AppState>()
const { useCommand } = addCommands({
  start: (s) => {
    s.isRunning = true
  },
  stop: (s) => {
    s.isRunning = false
  },
  progress: (s, data: { horseName: string; amount: number }) => {
    s.progress[data.horseName] += data.amount
  },
  addHorse: (s, data: { horse: RacingHorse }) => {
    s.horses.push(data.horse)
    s.progress[data.horse.name] = 0
  },
})
