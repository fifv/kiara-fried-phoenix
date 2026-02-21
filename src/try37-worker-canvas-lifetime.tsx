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
            } }>Activity: { isActive ? "ON" : "OFF" }</button>
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
     * We must terminate worker, otherwise worker will be leaked
     * 
     * The lifetime of the component is longer than the [] effect,
     * (i.e. Worker may be terminated & recreated multiple times, while canvas be mounted)
     * 1. HMR will cleanup => redo
     * 2. Activity.hidden will cleanup Activity.visible will redo
     * 
     * Current Solution:
     * Don't be eager to reset canvas (with a different key) and send to worker when new worker created,
     * which maybe impossible (the flushSync doesn't work in effect).
     * instead, setState a new key to trigger a re-render later,
     * use another effect (with no dep array) to monitor the change of new canvas ref
     */
    useEffect(() => {
        console.log("[] New Worker")
        const worker = new Worker(new URL('./try37-worker-canvas-lifetime.worker.tsx', import.meta.url))
        refWorker.current = worker

        return () => {
            console.log("[] Terminate Worker")
            /**
             * this will trigger re-render if the component is still mounted
             */
            setHackKey((x) => x + 1)
            const worker = refWorker.current
            if (worker) {
                worker.terminate()
            }
        }
    }, [])

    /**
     * Must put after the woker creation effect, so the `refWorker.current`
     * should be always available
     */
    useEffect(() => {
        const worker = refWorker.current
        const currentCanvas = refCanvas.current
        // const prevCanvas = refCanvasPrev.current
        /**
         * refWorker.current and refCanvas.current should always be available
         */
        if (worker && currentCanvas) {
            // try {
            /**
             * refCanvasPrev.current stores transferred canvas,
             * so if `refCanvas.current` !== `refCanvasPrev.current`, 
             * the `refCanvas.current` must be not transferred yet
             * 
             * so no trycatch needed
             */
            if (currentCanvas !== refCanvasPrev.current) {
                console.log('canvas changed! current  canvas key:', hackKey)
                const offScreen = currentCanvas.transferControlToOffscreen()
                worker.postMessage({
                    offScreen: offScreen
                }, [offScreen])
                refCanvasPrev.current = currentCanvas
                console.log('transfered!')
            }
            // } catch (error) {
            //     console.log('failed to transfer!', error)
            //     setHackKey((x) => x + 1)
            // }
        } else {
            console.error("No Worker or refCanvas.current?! This shouldn't happen!", refWorker.current, refCanvas.current)
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
