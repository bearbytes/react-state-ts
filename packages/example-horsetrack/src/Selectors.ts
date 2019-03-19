import { AppState } from './types'

export function selectHorseNames(s: AppState) {
  return s.horses.map((horse) => horse.name)
}
