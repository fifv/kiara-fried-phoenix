import { clsx } from "clsx"
import { useEffect, useState } from "react"

interface Message {
    event: string
    data: any
}

function createWorker<T extends Function>(fn: T) {
    return new Worker(URL.createObjectURL(new Blob(['(', fn.toString(), ')()'], { type: 'application/javascript' })))
}

/**
 * Benchmark:
 * 100_000 postMessage() cost   135ms on 9700x@Chrome (i.e. ~1us per postMessage())
 *                              210ms on 5600@Chrome
 *                              330ms on 5600@Firefox
 *                              150ms on K80Pro@Chrome
 *                              1820ms on MIPAD4@Chrome (in which postMessage cost 730ms) (i.e. 20us)
 */
const worker = createWorker(async () => {
    const BENCH_COUNT = 100_000
    let ccc = 0
    let ttt = 0

    self.onmessage = async (msg) => {
        // console.log('worker receive:', msg)
        {
            if (msg.data.event === 'count') {
                await new Promise(resolve => setTimeout(resolve, 500))
                self.postMessage({
                    event: "count",
                    data: msg.data.data + 1,
                } satisfies Message)
            } else if (msg.data.event === 'benchmark') {
                ccc++
                if (ccc === 1) {
                    ttt = msg.data.data
                }
                if (ccc === BENCH_COUNT) {
                    ccc = 0
                    self.postMessage({
                        event: "benchmark",
                        data: Date.now() - ttt,
                    } satisfies Message)
                }
            }
        }
    }
})

export default function App() {
    const BENCH_COUNT = 100_000
    const [count, setCount] = useState(0)
    const [benchResult, setBenchResult] = useState(0)
    const [postAllElapsed, setPostAllElapsed] = useState(0)
    useEffect(() => {
        worker.onmessage = (msg) => {
            console.log('main receive:', msg)
            if (msg.data.event === 'count') {
                setCount(msg.data.data)

            } else if (msg.data.event === 'benchmark') {
                setBenchResult(msg.data.data)
            }
        }
    }, [])
    return (
        <div className={ clsx(
            'font-mono',
        ) }>

            <button onClick={ async () => {
                worker.postMessage({
                    event: "count",
                    data: count,
                    a: await window.queryLocalFonts()
                } satisfies Message)
            } }>fa { count }</button>

            <div>
                <button onClick={ () => {
                    const t1 = performance.now()
                    for (let i = 0; i < BENCH_COUNT*1; i++) {
                        worker.postMessage({
                            event: "benchmark",
                            data: Date.now(),
                        } satisfies Message)
                    }
                    setPostAllElapsed(performance.now() - t1)
                } }>Bench: post { BENCH_COUNT } messages and wait all be processed cost { benchResult } ms</button>
            </div>
            <div>
                Post All { BENCH_COUNT } messages cost { postAllElapsed.toFixed(2) } ms
            </div>
        </div>
    )
}
