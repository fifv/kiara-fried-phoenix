import { clsx } from "clsx"
import { useEffect, useRef, useState } from "react"
export default function App() {
    const [count, setCount] = useState(0)
    const refCanvas = useRef<HTMLCanvasElement>(null!)
    useEffect(() => {
        const canvas = refCanvas.current
        const gl = canvas.getContext("webgl2")
        if (gl === null) {
            alert('webgl2 not supported')
            throw "?"
        }
        gl.clearColor(0.5, 1.0, 0.7, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }, [])
    return (
        <div>
            <canvas ref={ refCanvas } className={ clsx(
                'm-4 w-3/4 h-[80vh] outline outline-dashed outline-amber-300/50',
            ) }>

            </canvas>
        </div>
    )
}
