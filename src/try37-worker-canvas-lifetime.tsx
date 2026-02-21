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
    const refWorker = useRef<Worker>(null)
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const refCanvasPrev = useRef<HTMLCanvasElement>(null)
    const refHackKey = useRef(0)
    const [hackKey, setHackKey] = useState(0)
    console.log("RENDER!!!!!!!!", 'refHackKey', refHackKey.current, 'hackKey', hackKey)

    /**
     * do clean up, otherwise worker leak
     * 
     */
    useEffect(() => {
        console.log("[] New Worker")
        const worker = new Worker(new URL('./try37-worker-canvas-lifetime.worker.tsx', import.meta.url))
        refWorker.current = worker

        return () => {
            console.log("[] Terminate Worker")
            setHackKey((x) => x + 1)
            const worker = refWorker.current
            if (worker) {
                worker.terminate()
            }
        }
    }, [])

    useEffect(() => {
        const worker = refWorker.current
        const currentCanvas = refCanvas.current
        // const prevCanvas = refCanvasPrev.current
        if (worker) {
            try {
                if (currentCanvas && currentCanvas !== refCanvasPrev.current) {
                    const offScreen = currentCanvas.transferControlToOffscreen()
                    worker.postMessage({
                        offScreen: offScreen
                    }, [offScreen])
                    console.log('transfered!')
                    refCanvasPrev.current = currentCanvas
                }
            } catch (error) {
                console.log('failed to transfer!', error)
                setHackKey((x) => x + 1)
            }
        }
    },)

    // const [count, setCount] = useState(0)
    return (
        <div>
            Canvas!


            <canvas
                // key={ refHackKey.current }
                key={ hackKey }
                className={ clsx(
                    'outline outline-red-300',
                ) } ref={ refCanvas } />
        </div>
    )
}
