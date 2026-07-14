import { clsx } from "clsx"
import { useEffect, useEffectEvent, useRef, useState } from "react"
import { getTrackBackground, Range } from "react-range"
export default function App() {
    const [frequency, setFrequency] = useState(1000)
    const [gain, setGain] = useState(0.01)
    const [isActive, setIsActive] = useState(false)

    const refOscillator = useRef<OscillatorNode>(null)
    const refGainNode = useRef<GainNode>(null)

    const getFrequency = useEffectEvent(() => frequency)
    const getGain = useEffectEvent(() => gain)

    useEffect(() => {
        const audioCtx = new AudioContext()
        // const oscillator = audioCtx.createOscillator()
        const oscillator = new OscillatorNode(audioCtx, {
            type: "sine",
            // frequency: frequency,
            // frequency: 1000,
            frequency: getFrequency(),
        })
        refOscillator.current = oscillator

        const gainNode = new GainNode(audioCtx, {
            gain: getGain()
        })
        refGainNode.current = gainNode
        // oscillator.connect(audioCtx.destination)
        oscillator.connect(gainNode)


        gainNode.connect(audioCtx.destination)
        console.log('audioCtx.state:', audioCtx.state)

        if (isActive) {
            oscillator.start()
            audioCtx.resume().then(() => {
                console.log('audioCtx.state:', audioCtx.state)
            })

            return () => {
                oscillator.stop()
                audioCtx.suspend().then(() => {
                    console.log('audioCtx.state:', audioCtx.state)
                })
                refOscillator.current = null
                refGainNode.current = null
            }
        }

    }, [isActive])

    useEffect(() => {
        const oscillator = refOscillator.current
        if (oscillator) {
            oscillator.frequency.setValueAtTime(frequency, 0)
        }
    }, [frequency])

    useEffect(() => {
        const gainNode = refGainNode.current
        if (gainNode) {
            gainNode.gain.setValueAtTime(gain, 0)
        }
    }, [gain])

    /**
     * map 20~20000 -> 0.0~1.0, with logrithm (i.e. change slow at first, then faster at end)
     */
    function rangeToLogUnit(rawValue: number, rawValueMin: number, rawValueMax: number) {
        return Math.log(rawValue / rawValueMin) / Math.log(rawValueMax / rawValueMin)
    }
    function logUnitToRange(unitValue: number, rawValueMin: number, rawValueMax: number) {
        return rawValueMin * (rawValueMax / rawValueMin) ** (unitValue)
    }


    return (
        <div>
            <button className={ clsx(
                isActive && 'bg-red-400!',
                // !isActive &&'bg-red-300!',
            ) } onClick={ () => {
                setIsActive((x) => (!x))
            } }>{ isActive ? "Stop" : "Play" }</button>

            <div className={ clsx(
                'mx-12 w-[80vw]',
            ) }>
                { (() => {
                    const min = 20
                    const max = 20000
                    return <BasicRange value={ rangeToLogUnit(frequency, min, max) } setValue={ (x) => setFrequency(logUnitToRange(x, min, max)) } />
                })() }
            </div>
            <div className={ clsx(
                'mx-12 w-[80vw]',
            ) }>
                { (() => {
                    /**
                     * 10^-5 == -100dB
                     * 10^-4 == -80dB
                     */
                    const min = 1e-4
                    const max = 1
                    return <BasicRange value={ rangeToLogUnit(gain, min, max) } setValue={ (x) => setGain(logUnitToRange(x, min, max)) } />
                })() }
            </div>
            <div className={ clsx(
                'mx-12 w-[80vw]',
            ) }>
                { (() => {
                    return <BasicRange value={ gain } setValue={ (x) => setGain(x) } />
                })() }
            </div>
            <div className={ clsx('font-mono mt-12',) }>
                Freq: { (frequency).toFixed(3) }
            </div>
            <div className={ clsx('font-mono',) }>
                Gain: { (gain).toFixed(10) } ({ (Math.log10(gain) * 20).toFixed(2) }dB)
            </div>
        </div>
    )
}









const BasicRange: React.FC<{ value: number, setValue: (value: number) => void, name?: string }> = ({ value, setValue, name = "" }) => {
    const STEP = 0.000001
    const MIN = 0
    const MAX = 1
    return (
        <div
            style={ {
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
            } }
        >
            <Range
                values={ [value * 10000] }
                step={ STEP }
                min={ MIN * 10000 }
                max={ MAX * 10000 }
                onChange={ (values) => setValue(values[0] / 10000) }
                renderTrack={ ({ props, children }) => (
                    <div
                        onMouseDown={ props.onMouseDown }
                        onTouchStart={ props.onTouchStart }
                        style={ {
                            ...props.style,
                            height: "72px",
                            display: "flex",
                            width: "100%",
                        } }
                    // className="w-full h-18 flex"
                    >
                        <div
                            ref={ props.ref }
                            style={ {
                                height: "5px",
                                width: "100%",
                                borderRadius: "4px",
                                background: getTrackBackground({
                                    values: [value * 10000],
                                    colors: ["#85fa80", "#ccc"],
                                    min: MIN * 10000,
                                    max: MAX * 10000,
                                }),
                                alignSelf: "center",
                            } }
                        >
                            { children }
                        </div>
                    </div>
                ) }
                renderThumb={ ({ props, isDragged }) => (
                    <div
                        { ...props }
                        key={ props.key }
                        style={ {
                            ...props.style,
                            height: "42px",
                            width: "42px",
                            borderRadius: "4px",
                            backgroundColor: "#FFF",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0px 2px 6px #AAA",
                        } }
                    >
                        <div
                            style={ {
                                height: "16px",
                                width: "5px",
                                backgroundColor: isDragged ? "#85fa80" : "#CCC",
                            } }
                        />
                    </div>
                ) }
            />
            <output style={ { marginTop: "0px" } } id="output" className={ clsx(
                'font-mono',
            ) }>
                { (value).toFixed(3) }
            </output>
        </div>
    )
}
