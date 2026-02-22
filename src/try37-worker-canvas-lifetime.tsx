import clsx from "clsx"
import { Activity, useEffect, useRef, useState } from "react"

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
                    <WorkerAndCanvas />
                </Activity>
            }
        </div>
    )
}
function WorkerAndCanvas() {
    const refWorker = useRef<Worker>(null)
    const refCanvas = useRef<HTMLCanvasElement>(null)
    const refCanvasPrev = useRef<HTMLCanvasElement>(null)
    // const refCanvasKey = useRef(0)
    const [canvasKey, setCanvasKey] = useState(0)
    console.log("⭕Render>>", 'canvasKey:', canvasKey)

    /**
     * We must terminate worker, otherwise worker will be leaked
     * 
     * The lifetime of the component is longer than the [] effect,
     * (i.e. Worker may be terminated & recreated multiple times, while canvas be mounted)
     * 1. HMR will cleanup => redo
     * 2. Activity.hidden will cleanup Activity.visible will redo
     * 
     * ## Current Solution:
     * Don't be eager to reset canvas (with a different key) and send to worker when new worker created,
     * which maybe impossible (the flushSync doesn't work in effect).
     * instead, setState a new key to trigger a re-render later,
     * use another effect (with no dep array) to monitor the change of new canvas ref.
     * 
     * The core logic is create a new canvas when worker is re-created,
     * luckily, setCanvasKey() in effect cleanup works well, and be patient to use a refCanvasPrev to track
     * and wait for canvas element actually change.
     * Don't put `refCanvas.current` in effect dep array, which is checked during render,
     * but the value may change after render finished and committed
     * (render means the body of component function, commit means react-dom actually changes DOM)
     * 
     * 
     * Though the canvas re-creation only happens when new worker created, I have tested that 
     * put transfer directly after new worker works on Activity On/Off, but crashes on HMR
     * Maybe that: when HMR triggered, the setState run, schedule a new re-render,
     * but HMR also trigger a re-render, and that runs before the setState re-render,
     * so in the effect where new worker created, the canvas element is still old one.
     * After that re-render finished, a new re-render with new canvas kicks in
     * 
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
            setCanvasKey((x) => x + 1)
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
                console.log('canvas changed! current canvasKey:', canvasKey)
                const offScreen = currentCanvas.transferControlToOffscreen()
                worker.postMessage({
                    offScreen: offScreen
                }, [offScreen])
                refCanvasPrev.current = currentCanvas
                console.log('transfered!')
            }
            // } catch (error) {
            //     console.log('failed to transfer!', error)
            //     setCanvasKey((x) => x + 1)
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
                // key={ refCanvasKey.current }
                key={ canvasKey }
                className={ clsx(
                    'outline outline-red-300',
                ) } ref={ refCanvas } />
        </div>
    )
}
