import useWebSocket, { ReadyState, } from "react-use-websocket"
import { useEffect, useMemo, useRef, useState } from "react"
import { clsx } from "clsx"
import Fft from 'fft.js'
import { blackman, blackman_harris, hann } from "fft-windowing-ts"
import { useImmer } from "use-immer"
import { enableMapSet } from 'immer'

import AudioSineWaveGenerator from './try43-audiocontext'
import { chunk, maxBy, mean } from "es-toolkit"
import uPlot from "uplot"
import "uplot/dist/uPlot.min.css"
import { create, ConverterType } from '@alexanderolsen/libsamplerate-js'
import UPlotReact from "uplot-react"

function downsample(samples: number[], scale: number): number[] {
    if (!Number.isSafeInteger(scale) || scale < 1) {
        throw new RangeError("downsample scale must be a positive integer")
    }

    const outputLength = Math.floor(samples.length / scale)
    const output = new Array<number>(outputLength)

    for (let outputIndex = 0; outputIndex < outputLength; outputIndex++) {
        const inputStart = outputIndex * scale
        let sum = 0

        for (let offset = 0; offset < scale; offset++) {
            sum += samples[inputStart + offset]!
        }

        output[outputIndex] = sum / scale
    }

    return output
}

enableMapSet()


export default function App() {
    /* length == 512 */
    const [spectrum, setSpectrum] = useState<number[]>(new Array(512))
    const [spectrumLow, setSpectrumLow] = useState<number[]>([])
    // const [samples, setSamples] = useState<number[]>([])
    const [peakMap, setPeakMap] = useImmer<FrequencyPeakMap>(new Map)


    const refSamples = useRef<number[]>([])
    const refLibsamplerate = useRef<Awaited<ReturnType<typeof create>>>(null)
    useEffect(() => {
        create(1, 48000, 1500, { converterType: ConverterType.SRC_SINC_BEST_QUALITY }).then(src => {
            refLibsamplerate.current = src
        })
    }, [])

    const { sendJsonMessage, readyState, getWebSocket, } = useWebSocket<WsRxMessage | null>(
        `ws://${location.hostname}:3304/wscom`,
        {
            share: false,
            shouldReconnect: () => true,
            reconnectInterval: 500,
            reconnectAttempts: Infinity,
        },
        true
    )

    useEffect(() => {
        console.log("Connection state changed, re-open and re-list")
        if (readyState === ReadyState.OPEN) {
            sendJsonMessage({
                event: "com-open",
                data: {
                    path: "COM6",
                    id: '',
                    baudRate: 115200
                },
            } satisfies WsTxMessage)
        }
    }, [readyState, sendJsonMessage])


    useEffect(() => {
        const handleWs = (e: MessageEvent) => {
            const wsMessage = JSON.parse(e.data) as WsRxMessage

            // console.log('Got a new json message:', wsMessage)

            if (wsMessage?.event === 'com-rx') {
                // refOnRxs.current.forEach((onRx) => {
                //     onRx(wsMessage.data.payload)
                // })

                if (false) {
                    /* FFT'd data */
                    /* @ts-expect-error shut up */
                    if (wsMessage.data.payload.length === 2048) {
                        /* @ts-expect-error shut up */
                        const u8buffer = Uint8Array.from(wsMessage.data.payload)
                        const spectrum = new Float32Array(u8buffer.buffer, u8buffer.byteOffset)
                        // console.log(spectrum)
                        setSpectrum(Array.from(spectrum))
                    } else {
                        console.error("length error")
                    }
                }

                if (true) {
                    const samples = refSamples.current
                    /* Raw sample data */
                    // console.log(wsMessage)
                    if (wsMessage.data.payload.length % 4 === 0) {
                        const sampleRate = 48000
                        // const fftSize = 8192
                        // const fftSize = 4096
                        const fftSize = 1024
                        const u8buffer = Uint8Array.from(wsMessage.data.payload)
                        const newSamples = new Float32Array(u8buffer.buffer, u8buffer.byteOffset)

                        // console.log("current samples", samples.length, performance.now())
                        samples.push(...newSamples)
                        if (samples.length < fftSize) {
                            /*  */
                        } else {
                            const enoughSamples = samples.slice(-fftSize)
                            const fft = new Fft(fftSize)
                            const fftResult = fft.createComplexArray() as number[]
                            fft.realTransform(fftResult, blackman_harris(enoughSamples))

                            /**
                             * even realTransform(), the result is still complex numbers, we need 
                             * 1. use first half, second half are just a mirror (samplerate@48000Hz -> firsthalf@24000Hz) (fftResult is fftSize*2)
                             * 2. use elegant chunk() to split all complex, and sqrt them (unnecessary)
                             * 3. FFT result is a sum, depened on fftSize, so /fftSize to normalize it. and *2 to compensate the second half lost
                             * 
                             * the spectrum.length === fftSize / 2 
                             */
                            const spectrum = chunk(fftResult.slice(0, fftSize), 2).map(([real, imag]) =>
                                Math.hypot(real, imag) * 2 / fftSize
                            )
                            // console.log(spectrum.length)
                            setSpectrum(spectrum)

                            const peak = maxBy(spectrum.map((value, i) => ({ value, i })), (x) => x.value)
                            if (peak) {
                                setPeakMap((peakMap) => {
                                    const frequency = Math.round((sampleRate / 2) * (peak.i / (fftSize / 2)))
                                    let existingPeak = peakMap.get(frequency)
                                    if (!existingPeak) {
                                        existingPeak = { amplitudes: [] }
                                        peakMap.set(frequency, existingPeak)
                                    }
                                    existingPeak.amplitudes.push(peak.value)
                                    // console.log(Math.round((sampleRate / 2) * (peak.i / (fftSize / 2))), existingPeak)
                                })
                            }
                            // console.log(fftResult)
                            // return []
                            /* purge too many samples */

                        }

                        if (samples.length > fftSize * 32) {
                            // create(1, 48000, 1500, { converterType: ConverterType.SRC_SINC_BEST_QUALITY }).then(src => {
                            //     const enoughSamples = samples.slice(-fftSize * 32)
                            //     const resampledSamples = src.simple(new Float32Array(enoughSamples))
                            //     // resampledSamples.

                            //     src.destroy()
                            // })
                            const libsamplerate = refLibsamplerate.current
                            if (libsamplerate) {
                                const enoughSamples = samples.slice(-fftSize * 32)
                                // const resampledSamples = libsamplerate.simple(new Float32Array(enoughSamples))
                                const resampledSamples = downsample(enoughSamples, 32)

                                const fft = new Fft(fftSize)
                                const fftResult = fft.createComplexArray() as number[]
                                fft.realTransform(fftResult, blackman_harris(Array.from(resampledSamples)))
                                const spectrum = chunk(fftResult.slice(0, fftSize), 2).map(([real, imag]) =>
                                    Math.hypot(real, imag) * 2 / fftSize
                                )
                                setSpectrumLow(Array.from(spectrum))
                            }
                        }

                        // console.log(peakMap)
                        // console.log(spectrum)
                        // setSpectrum(Array.from(spectrum))
                        if (refSamples.current.length > fftSize * 128) {
                            refSamples.current = refSamples.current.slice(-fftSize * 64)
                        }
                    } else {
                        console.error("Raw data should be N of f32, length should be mutiply of 4, but got", wsMessage.data)
                    }
                }

            }
        }
        if (readyState === ReadyState.OPEN) {
            const ws = getWebSocket()
            if (ws) {
                ws.addEventListener('message', handleWs as EventListenerOrEventListenerObject)
                return () => {
                    ws.removeEventListener('message', handleWs as EventListenerOrEventListenerObject)
                }
            }
        }
        /* since we use addEventListener now, which is safe an fast, we can ignore the chance that effect run too much */
    }, [getWebSocket, peakMap, readyState, setPeakMap])

    return (
        <div>
            {
                // spectrum.map((v) => <div>{ v }</div>)
            }
            <div className={ clsx(
                'm-8',
            ) }>

                <SpectrumCanvas spectrum={ spectrum } />
                <SpectrumCanvas spectrum={ (() => {
                    // console.log(peakMap)
                    const spect = new Array(spectrum.length).fill(0)
                    for (const [frequency, value] of peakMap) {
                        spect[Math.round(frequency / (48000 / 2) * spectrum.length)] = mean(value.amplitudes)
                    }
                    return spect
                })() } />

                <SpectrumUplot spectrum={ spectrum } />
                <SpectrumLowUplot spectrum={ spectrumLow } />
            </div>
            <AudioSineWaveGenerator />
            {/* <button onClick={ () => { playSineWave(20, 1) } }>20</button>
            <button onClick={ () => { playSineWave(40, 1) } }>40</button>
            <button onClick={ () => { playSineWave(140, 1) } }>140</button>
            <button onClick={ () => { playSineWave(240, 1) } }>240</button>
            <button onClick={ () => { playSineWave(440, 1) } }>440</button>
            <button onClick={ () => { playSineWave(1440, 1) } }>1440</button>
            <button onClick={ () => { playSineWave(2440, 1) } }>2440</button>
            <button onClick={ () => { playSineWave(3440, 1) } }>3440</button>
            <button onClick={ () => { playSineWave(8440, 1) } }>8440</button>
            <button onClick={ () => { playSineWave(20000, 1) } }>20000</button>
            <button onClick={ () => { playSineWave(30000, 1) } }>30000</button>
            <button onClick={ () => { playSineWave(48000, 1) } }>48000</button> */}
        </div>
    )
}


function playSineWave(frequency: number = 440, duration: number = 1): void {
    const audioCtx = new window.AudioContext()

    const oscillator = audioCtx.createOscillator()
    // 1. Create a volume controller
    const gainNode = audioCtx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // 2. Set the volume (0.0 is silent, 1.0 is full blast, 0.1 is 10% volume)
    gainNode.gain.value = 0.03

    // 3. Connect: Oscillator -> Volume Controller -> Speakers
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + duration)
}

type FrequencyPeakMap = Map<
    number, {
        // frequnecy: number
        amplitudes: number[]
    }
>


export const SpectrumCanvas: React.FC<{ spectrum: number[] }> = ({ spectrum }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const resizeObserver = new ResizeObserver(([entry]) => {
                if (entry.target instanceof HTMLCanvasElement) {
                    entry.target.width = entry.devicePixelContentBoxSize[0]?.inlineSize ?? 0
                    entry.target.height = entry.devicePixelContentBoxSize[0]?.blockSize ?? 0
                }
            })
            resizeObserver.observe(canvas, { box: "device-pixel-content-box" })
            return () => {
                resizeObserver.disconnect()
            }
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 清除畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 計算每一條頻譜長條圖的寬度
        const barWidth = canvas.width / spectrum.length

        // 開始繪製
        ctx.fillStyle = '#3b82f6' // 藍色頻譜線
        // ctx.fillStyle = 'rgb(255, 255, 255)'




        // for (let i = 0; i < spectrum.length; i++) {
        //     const value = spectrum[i] || 0

        //     // 假設數值已被正規化在 0 到 1 之間（若數值較大，可乘以調整係數）
        //     const barHeight = value * canvas.height

        //     const x = i * barWidth
        //     // Canvas 的座標 (0,0) 在左上角，所以 y 軸需要反轉計算
        //     const y = canvas.height - barHeight

        //     ctx.fillRect(x, y, barWidth - 1, barHeight) // 保留 1px 間隔
        // }



        const numBars = spectrum.length

        // for (let i = 0; i < numBars; i++) {
        //     const value = spectrum[i] || 0
        //     const barHeight = value * canvas.height // 這裡假設 Y 軸維持線性，若要兩者皆對數可結合上方算式

        //     // 1. 計算目前這點在對數尺度下的 X 座標百分比 (0 ~ 1)
        //     // 公式：log(i + 1) / log(總長度)
        //     const logXCurrent = Math.log(i + 1) / Math.log(numBars)

        //     // 2. 計算下一點的 X 座標百分比，用來決定這一根長條圖的寬度
        //     const logXNext = Math.log(i + 2) / Math.log(numBars)

        //     // 3. 換算成畫布的實際像素位置
        //     const x = logXCurrent * canvas.width
        //     const nextX = logXNext * canvas.width
        //     const dynamicBarWidth = Math.max(1, nextX - x) // 確保寬度至少有 1 像素

        //     const y = canvas.height - barHeight

        //     // 繪製（左邊低頻的長條會比較寬，右邊高頻會被壓縮擠在一起）
        //     ctx.fillRect(x, y, dynamicBarWidth - 0.5, barHeight)
        // }



        // 根據 ES8388 規格設定合理的視覺動態範圍
        const MAX_DB = 0     // 畫布最頂端 (0 dB)
        const MIN_DB = -100    // 畫布最底端 (-70 dB)，環境雜訊以下切掉不看

        // for (let i = 0; i < numBars; i++) {
        //     const amplitude = spectrum[i] || 0

        //     // 1. 防止 0 帶入 log10 導致負無限大
        //     const safeAmp = Math.max(amplitude, 1e-5)

        //     // 2. 轉成分貝 dB (這裡假設 MCU 傳過來的最大振幅已歸一化在 1 左右)
        //     let db = 20 * Math.log10(safeAmp)

        //     // 3. 限制區間在 -70dB 到 0dB
        //     if (db < MIN_DB) db = MIN_DB
        //     if (db > MAX_DB) db = MAX_DB

        //     // 4. 線性映射到畫布高度比例 (0.0 ~ 1.0)
        //     // 當 db = 0  -> yRatio = 1.0 (全滿)
        //     // 當 db = -70 -> yRatio = 0.0 (底部)
        //     const yRatio = (db - MIN_DB) / (MAX_DB - MIN_DB)
        //     const barHeight = yRatio * canvas.height

        //     // 5. 繪製
        //     const x = i * barWidth
        //     const y = canvas.height - barHeight
        //     ctx.fillRect(x, y, barWidth - 1, barHeight)
        // }


        for (let i = 0; i < numBars; i++) {
            const amplitude = spectrum[i] || 0

            // 1. 防止 0 帶入 log10 導致負無限大
            const safeAmp = Math.max(amplitude, 1e-5)

            // 2. 轉成分貝 dB (這裡假設 MCU 傳過來的最大振幅已歸一化在 1 左右)
            let db = 20 * Math.log10(safeAmp)

            // 3. 限制區間在 -70dB 到 0dB
            if (db < MIN_DB) db = MIN_DB
            if (db > MAX_DB) db = MAX_DB

            // 4. 線性映射到畫布高度比例 (0.0 ~ 1.0)
            // 當 db = 0  -> yRatio = 1.0 (全滿)
            // 當 db = -70 -> yRatio = 0.0 (底部)
            const yRatio = (db - MIN_DB) / (MAX_DB - MIN_DB)
            const barHeight = yRatio * canvas.height

            // 1. 計算目前這點在對數尺度下的 X 座標百分比 (0 ~ 1)
            // 公式：log(i + 1) / log(總長度)
            const logXCurrent = Math.log(i + 1) / Math.log(numBars)

            // 2. 計算下一點的 X 座標百分比，用來決定這一根長條圖的寬度
            const logXNext = Math.log(i + 2) / Math.log(numBars)

            // 3. 換算成畫布的實際像素位置
            const x = logXCurrent * canvas.width
            const nextX = logXNext * canvas.width
            const dynamicBarWidth = nextX - x

            const y = canvas.height - barHeight

            // 繪製（左邊低頻的長條會比較寬，右邊高頻會被壓縮擠在一起）
            ctx.fillRect(x, y, dynamicBarWidth, barHeight)
        }
    }, [spectrum]) // 每當 50 FPS 的 spectrum 陣列更新時，就直接在畫布重繪

    return (
        <canvas
            ref={ canvasRef }
            width={ 600 }
            height={ 200 }
            style={ { background: '#111827', borderRadius: '8px', width: '100%', height: 'auto' } }
        />
    )
}





export const SpectrumUplot: React.FC<{ spectrum: number[] }> = ({ spectrum }) => {
    const [options, setOptions] = useState<uPlot.Options>(
        useMemo(
            () => ({
                title: "Chart",
                width: 1000,
                height: 300,
                series: [
                    {
                        label: "Hz",
                    },
                    {
                        label: "dB",
                        points: { show: false },
                        // stroke: "blue",
                        fill: "rgb(135, 183, 134)",
                    }
                ],
                // plugins: [dummyPlugin()],
                scales: {
                    x: {
                        time: false,
                        distr: 3, /* uPlot.Scale.Distr.Logarithmic */
                        log: 10,
                        range: [20, 20_000],
                    },
                    y: {
                        distr: 3,/* uPlot.Scale.Distr.Logarithmic */
                        min: 1e-5,
                        max: 1,
                        // range: [1, 1e-5],
                        range: [1e-5, 1],
                        log: 10,
                    },

                }
            }),
            []
        )
    )


    const data: uPlot.AlignedData = [
        spectrum.map((x, i, arr) => ((i + 1) * (48000 / 2 / arr.length))),
        spectrum,
    ]
    return (
        <UPlotReact
            key="hooks-key"
            options={ options }
            data={ data }
            // target={ root }
            onDelete={ (/* chart: uPlot */) => console.log("Deleted from hooks") }
            onCreate={ (/* chart: uPlot */) => console.log("Created from hooks") }
        />
    )
}
export const SpectrumLowUplot: React.FC<{ spectrum: number[] }> = ({ spectrum }) => {
    const [options, setOptions] = useState<uPlot.Options>(
        useMemo(
            () => ({
                title: "Chart",
                width: 1000,
                height: 300,
                series: [
                    {
                        label: "Hz",
                    },
                    {
                        label: "dB",
                        points: { show: false },
                        // stroke: "blue",
                        fill: "rgb(135, 183, 134)",
                    }
                ],
                // plugins: [dummyPlugin()],
                scales: {
                    x: {
                        time: false,
                        distr: 3, /* uPlot.Scale.Distr.Logarithmic */
                        log: 10,
                        range: [20, 1000],
                    },
                    y: {
                        distr: 3,/* uPlot.Scale.Distr.Logarithmic */
                        min: 1e-5,
                        max: 1,
                        // range: [1, 1e-5],
                        range: [1e-5, 1],
                        log: 10,
                    },

                }
            }),
            []
        )
    )

    const data: uPlot.AlignedData = [
        spectrum.map((x, i, arr) => ((i + 1) * (1500 / 2 / arr.length))),
        spectrum,
    ]
    return (
        <UPlotReact
            key="hooks-key"
            options={ options }
            data={ data }
            // target={ root }
            onDelete={ (/* chart: uPlot */) => console.log("Deleted from hooks") }
            onCreate={ (/* chart: uPlot */) => console.log("Created from hooks") }
        />
    )
}





export interface PortInfo {
    path: string
    friendlyName: string | undefined
}


type _WsTxEventMap = {
    'com-tx': {
        id: string
        path: string
        payload: number[]
    }
    'com-open': {
        id: string
        path: string
        baudRate: number
    }
    'com-close': {
        id: string
        path: string
    }
    'com-list': undefined | null
}

export type WsTxMessage = {
    [K in keyof _WsTxEventMap]: {
        event: K
        data: _WsTxEventMap[K]
    }
}[keyof _WsTxEventMap]

type _WsRxEventMap = {
    'com-rx': {
        id: string
        path: string
        payload: number[] /* u8 array */
    }
    'com-opened': {
        id: string
        path: string
    }
    'com-baudrate-changed': {
        id: string
        path: string
        baudRate: number
    }
    'com-closed': {
        id: string
        path: string
        reason?: string
    }
    'com-error': {
        id: string
        path?: string
        message: string
        code?: number
    }
    'com-list': {
        ports: PortInfo[]
    }
    'point': {
        id: number
        x: number
        y: number
    }
}

export type WsRxMessage = {
    [K in keyof _WsRxEventMap]: {
        event: K
        data: _WsRxEventMap[K]
    }
}[keyof _WsRxEventMap]
