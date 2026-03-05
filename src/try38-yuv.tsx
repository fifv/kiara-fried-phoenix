import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
/**
 * yuv-canvas has great performance with WebGL, but it is unusable, for the sake of lacking typescript, and more 
 * critical, only support YUV Planar
 */
export default function App() {
    const [count, setCount] = useState(0)
    const refCanvas = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
    }, [])

    async function drawImageData() {
        const yuvData = await fetch('./frame-000001-1920x1080@NV16.yuv').then((r) => {
            return r.arrayBuffer()
        })
        const width = 1920
        const height = 1080
        const format = 'NV16'
        const correctSize = 1920 * 1080 * 2

        function getImageDataFromNV16(width: number, height: number, yuvData: ArrayBuffer): ImageData {
            const t1 = performance.now()
            const yuvBuffer = new Uint8ClampedArray(yuvData)
            const rgbBuffer = new Uint8ClampedArray(width * height * 4)
            const imageData = new ImageData(rgbBuffer, width, height)
            const t2 = performance.now()
            console.log((t2 - t1).toFixed(1), 'ms', 'new buffer')
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const Y = yuvBuffer[y * width + x]
                    const U = yuvBuffer[width * height + Math.floor((y * width + x) / 2) * 2 + 0]
                    const V = yuvBuffer[width * height + Math.floor((y * width + x) / 2) * 2 + 1]

                    const R = Y + 1.4075 * (V - 128)
                    const G = Y - 0.3455 * (U - 128) - (0.7169 * (V - 128))
                    const B = Y + 1.7790 * (U - 128)

                    rgbBuffer[(y * width + x) * 4 + 0] = R
                    rgbBuffer[(y * width + x) * 4 + 1] = G
                    rgbBuffer[(y * width + x) * 4 + 2] = B
                    rgbBuffer[(y * width + x) * 4 + 3] = 0xFF
                }
            }
            const t3 = performance.now()
            console.log((t3 - t2).toFixed(1), 'ms', 'convert yuv to rgb')

            return imageData
        }

        const canvas = refCanvas.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx) {
            const imageData = getImageDataFromNV16(width, height, yuvData)

            const t1 = performance.now()
            /**
             * This will clear rect then draw
            */
            ctx?.putImageData(imageData, 0, 0)
            const t3 = performance.now()
            console.log((t3 - t1).toFixed(1), 'ms', 'putImageData')
        }
    }

    return (
        <div>
            <button onClick={ () => {
                drawImageData()
            } }>Draw</button>
            <div className={ clsx(
                'h-[80dvh] m-8 outline outline-double outline-white/15',
            ) }>
                <canvas width={ 1920 } height={ 1080 } className={ clsx(
                    'w-full h-full',
                ) } ref={ refCanvas }></canvas>
            </div>
        </div>
    )
}
