/* eslint-disable react-hooks/immutability */
import clsx from "clsx"
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { useLocalStorage } from "usehooks-ts"
/**
 * yuv-canvas has great performance with WebGL, but it is unusable, for the sake of lacking typescript, and more 
 * critical, only support YUV Planar
 */
export default function App() {
    // const { current: current, entries: entries, setCurrent: setCurrentImageUrl, setEntries: setImageUrls } = usePersistSelectList('imageUrl', 'http://192.168.30.130:5882/api/capture-raw', ['http://192.168.30.130:5882/api/capture-raw'])
    const [imageUrl, setImageUrl] = useLocalStorage('imageUrl' + '/current', 'http://192.168.30.130:5882/api/capture-raw')
    const [imageWidth, setImageWidth] = useLocalStorage('imageWidth' + '/current', 1920)
    const [imageHeight, setImageHeight] = useLocalStorage('imageHeight' + '/current', 1080)
    const [imageStride, setImageStride] = useLocalStorage('imageStride' + '/current', 2048)
    const [isContinuousDraw, setIsContinuousDraw] = useState(false)
    const [historyYuvData, setHistoryYuvData] = useState<ArrayBuffer[]>([])

    const refCanvas = useRef<HTMLCanvasElement>(null)



    const drawImageData = useCallback(
        function drawImageData(yuvData: ArrayBuffer) {
            function getImageDataFromNV16(width: number, stride: number, height: number, yuvData: ArrayBuffer): ImageData {
                const t1 = performance.now()
                const yuvBuffer = new Uint8ClampedArray(yuvData)
                const rgbBuffer = new Uint8ClampedArray(width * height * 4)
                const imageData = new ImageData(rgbBuffer, width, height)
                const t2 = performance.now()
                console.log((t2 - t1).toFixed(1), 'ms', 'new buffer')
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const Y = yuvBuffer[y * stride + x]
                        const U = yuvBuffer[stride * height + Math.floor((y * stride + x) / 2) * 2 + 0]
                        const V = yuvBuffer[stride * height + Math.floor((y * stride + x) / 2) * 2 + 1]

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
                const imageData = getImageDataFromNV16(imageWidth, imageStride, imageHeight, yuvData)

                const t1 = performance.now()
                /**
                 * This will clear rect then draw
                */
                ctx?.putImageData(imageData, 0, 0)
                const t3 = performance.now()
                console.log((t3 - t1).toFixed(1), 'ms', 'putImageData')
            }
        }, [imageHeight, imageStride, imageWidth]
    )
    const fetchAndDrawImageData = useCallback(
        async function fetchAndDrawImageData() {
            const t1 = performance.now()
            // const yuvData = await fetch('./frame-000001-1920x1080@NV16.yuv').then((r) => { return r.arrayBuffer() })
            const yuvData = await fetch(imageUrl).then((r) => { return r.arrayBuffer() })
            console.log((performance.now() - t1).toFixed(1), 'ms', 'download raw data')
            // const width = 1920
            // // const stride = 1920
            // const stride = 2048
            // const height = 1080
            const format = 'NV16'
            // const correctSize = 1920 * 1080 * 2
            setHistoryYuvData((x) => [...x, yuvData].slice(-64))

            drawImageData(yuvData)
        }, [drawImageData, imageUrl]
    )


    // useEffect(() => {
    //     const si = setInterval(() => {
    //         drawImageData()
    //     }, 100)
    //     return () => {
    //         clearInterval(si)
    //     }
    // }, [drawImageData])

    useEffect(() => {
        if (isContinuousDraw) {
            let stop = false
            async function doit() {
                if (!stop) {
                    fetchAndDrawImageData().then(() => {
                        doit()
                    })
                }
            }
            doit()
            return () => {
                stop = true
            }
        }
    }, [fetchAndDrawImageData, isContinuousDraw])

    useEffect(() => {
        if (!isContinuousDraw) {
            const yuvData = historyYuvData.at(-1)
            if (yuvData) {
                drawImageData(yuvData)
            }
        }
    }, [drawImageData, historyYuvData, imageHeight, imageStride, imageWidth, isContinuousDraw])


    return (
        <div>

            <div className={ clsx(
                'h-[80dvh] m-8 outline outline-double outline-white/15',
            ) }>
                <canvas width={ imageWidth } height={ imageHeight } className={ clsx(
                    'w-full h-full',
                ) } ref={ refCanvas }></canvas>
            </div>
            <button onClick={ () => {
                fetchAndDrawImageData()
            } }>Draw</button>
            <button onClick={ () => {
                setIsContinuousDraw((x) => (!x))
            } }>{ isContinuousDraw ? 'Auto' : 'Manual' }</button>

            <div className="flex w-full">

                <PersistSelectList persistKey="imageUrl" current={ imageUrl } setCurrent={ setImageUrl } />
                {/* must check NaN, as useLocalStorage will convert NaN to null */ }
                <PersistSelectList persistKey="imageWidth" current={ imageWidth.toString() } setCurrent={ (x) => { const v = parseInt(x); if (Number.isFinite(v)) setImageWidth(v) } } />
                <PersistSelectList persistKey="imageHeight" current={ imageHeight.toString() } setCurrent={ (x) => { const v = parseInt(x); if (Number.isFinite(v)) setImageHeight(v) } } />
                <PersistSelectList persistKey="imageStride" current={ imageStride.toString() } setCurrent={ (x) => { const v = parseInt(x); if (Number.isFinite(v)) setImageStride(v) } } />
                <div className="flex justify-start text-center items-start flex-nowrap gap-0.5 grow">
                    { historyYuvData.map((x, i) =>
                        <div className={ clsx(
                            ' h-12 py-4  grow rounded-sm bg-amber-500 hover:bg-amber-700',
                        ) } onPointerEnter={ () => {
                            setIsContinuousDraw(false)
                            drawImageData(x)
                        } } onPointerDown={ () => {
                            setIsContinuousDraw(false)
                            drawImageData(x)
                        } }>
                            {/* { i } */}
                        </div>)
                    }
                </div>
            </div>

        </div>
    )
}


function usePersistSelectList<T>(persistKey: string, initialValue: T, initialList: T[] = []) {
    const [entries, setEntries] = useLocalStorage<T[]>(persistKey + '/entries', initialList)
    const [current, setCurrent] = useLocalStorage<T>(persistKey + '/current', initialValue)
    return {
        entries: entries,
        current: current,
        setEntries: setEntries,
        setCurrent: setCurrent,
    }
}


function PersistSelectList({ persistKey, current, setCurrent }: {
    persistKey: string,
    current: string,
    setCurrent: (x: string) => void,
}) {
    // const { current: current, entries: entries, setCurrent: setCurrent, setEntries: setEntries } = usePersistSelectList('imageUrl', 'http://192.168.30.130:5882/api/capture-raw', ['http://192.168.30.130:5882/api/capture-raw'])

    const [entries, setEntries] = useLocalStorage<string[]>(persistKey + '/entries', [current])

    return (
        <div tabIndex={ 0 } className="BaudrateList h-fit rounded-lg m-2 max-w-min right-0 menu bg-zinc-700 rounded-box z-1  p-2 shadow-sm">
            { [...entries, null].map((entry, i) =>
                <input className={ clsx(
                    // ' w-full bg-inherit focus:outline-none  ',

                    'rounded-lg  px-2 py-1 ',
                    // currentBaudrate === baudrate && 'outline-solid outline-cyan-200',
                    current === entry && 'bg-blue-500 text-gray-300',
                    current !== entry && 'hover:bg-white/5 bg',
                    'focus:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                ) } key={ i } placeholder={ persistKey }
                    onChange={ (e) => {
                        setEntries((x) => {
                            const newEntries = x.slice()
                            const newEntry = (e.currentTarget.value)
                            newEntries[i] = newEntry
                            if (newEntry.trim()) {
                                setCurrent(newEntry)
                            }
                            return newEntries.filter((newCustomBaudrate) => newCustomBaudrate.trim())
                        })
                    } }
                    onPointerDown={ (e) => {
                        if (entry) {
                            setCurrent(entry)
                        }
                    } }
                    value={ entry ?? "" } />

            ) }
        </div>
    )
}