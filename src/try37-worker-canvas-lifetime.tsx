import clsx from "clsx"
import { Activity, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"


export default function App() {
    const [isMount, setIsMount] = useState(true)
    const [isActive, setIsActive] = useState(true)

    return (
        <div>
            <button onClick={ () => {
                setIsMount((x) => (!x))
            } }>Mount: { isMount ? "ON" : "OFF" }</button>
            <button onClick={ () => {
                setIsActive((x) => (!x))
            } }>Activity: { isMount ? "ON" : "OFF" }</button>
            {
                isMount &&
                <Activity mode={ isActive ? "visible" : "hidden" } >
                    <T />
                </Activity>
            }
        </div>
    )
}
function T() {
    console.log("RENDER!!!!!!!!")
    const refWorker = useRef<Worker>(null)
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const refHackKey = useRef(0)
    const [hackKey, setHackKey] = useState(0)
    useEffect(() => {
        console.log("EFFECT!!!!");
        const worker = new Worker(new URL('./try37-worker-canvas-lifetime.worker.tsx', import.meta.url))
        refWorker.current = worker
        if (refCanvas.current) {
            const offScreen = refCanvas.current.transferControlToOffscreen()

            worker.postMessage({
                offScreen: offScreen
            }, [offScreen])
        }
        return () => {
            console.log("CLEAN UP!!!");
            refHackKey.current++
            flushSync(() => {
                setHackKey((x) => x + 1)
            })
            worker.terminate()
        }
    }, [])
    // const [count, setCount] = useState(0)
    return (
        <div>
            Canvas!


            <canvas
                // key={ refHackKey.current }
                // key={ hackKey }
                className={ clsx(
                    'outline outline-red-300',
                ) } ref={ refCanvas } />
        </div>
    )
}
