import React from 'react'
import { Observable } from 'rxjs'
import { BehaviorSubject } from 'rxjs'

export interface CreateStoreOptions<TState, TEvents> {
  initialState: TState
}

export interface CreateStoreResult<TState, TEvents> {
  store: Store<TState, TEvents>

  useSelection<TSelection>(select: Select<TState, TSelection>): TSelection

  addCommands: AddCommands<TState, TEvents>
  StoreContainer: React.ComponentType<StoreContainerProps<TState>>
}

export interface AddCommands<TState, TEvents> {
  <TCommands extends Commands<TState, TEvents>>(
    commands: TCommands
  ): AddCommandsResult<TCommands>
}

export interface AddCommandsResult<TCommands> {
  useCommand: <TArgs extends any[]>(
    createAction: (...args: TArgs) => ActionType<TCommands>
  ) => (...args: TArgs) => void
  command: (action: ActionType<TCommands>) => void
}

export interface StoreContainerProps<TState> {
  initialState: TState
  children?: any
}

export interface Store<TState, TEvents> {
  state: BehaviorSubject<TState>
  events: Observable<EventType<TEvents>>

  dispatch<TData>(
    action: Action<TData>,
    implementation: Command<TState, TEvents, TData>
  ): void
}

export type Action<TData> = { type: string } & TData

export type Command<TState, TEvents, TData> = (
  state: TState,
  data: TData
) => void | EventType<TEvents> | EventType<TEvents>[]
export type Commands<TState, TEvents> = {
  [commandType: string]: Command<TState, TEvents, any>
}

export type EventType<TEvents> = EventTypes<TEvents>[keyof TEvents]
export type EventTypes<TEvents> = {
  [K in keyof TEvents]: { type: K } & TEvents[K]
}

export type ActionType<TCommands> = ActionTypes<TCommands>[keyof TCommands]
export type ActionTypes<TCommands> = {
  [K in keyof TCommands]: { type: K } & DataType<TCommands[K]>
}
export type DataType<TCommand> = TCommand extends Command<any, any, infer TData>
  ? TData
  : {}

export type Select<TState, TSelection> = (state: TState) => TSelection
