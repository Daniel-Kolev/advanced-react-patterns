// Latest Ref
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

function debounce<Callback extends (...args: Array<unknown>) => void>(
  fn: Callback,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

function useDebounce<Callback extends (...args: Array<unknown>) => unknown>(
  callback: Callback,
  delay: number,
) {
  return React.useMemo(() => debounce(callback, delay), [callback, delay])
}

function App() {
  const [step, setStep] = React.useState(1)
  const [count, setCount] = React.useState(0)
  const increment = React.useCallback(() => setCount(c => c + step), [step])
  const debouncedIncrement = useDebounce(increment, 1000)
  return (
    <div>
      <div>
        <label>
          Step:{' '}
          <input
            type="number"
            step="1"
            min="1"
            max="10"
            onChange={() => setStep(s => s + 1)}
            defaultValue={step}
          />
        </label>
      </div>
      <button onClick={debouncedIncrement}>{count}</button>
    </div>
  )
}

export default App
