import { createStore } from '.'

type S = typeof testState
const testState = {
  counter: 0,
}

const { addCommands } = createStore<typeof testState>()

const { useCommand, useCommand2 } = addCommands({
  'counter.reset': (s) => {
    s.counter = 0
  },
  'counter.increment': (s, data: { amount: number }) => {
    s.counter += data.amount
  },
  'counter.decrement': (s, data: { amount: number }) => {
    s.counter -= data.amount
  },
  imposter: function(s, data: { prop: boolean }) {},
  imposter2: function(s, data: { prop: boolean }) {},
})

useCommand('counter.reset', {})
useCommand('counter.increment', { amount: 2 })
useCommand('imposter', { prop: true })
useCommand('imposter2', { prop: false })

useCommand2(() => ({
  type: 'imposter2',
  prop: false,
}))
