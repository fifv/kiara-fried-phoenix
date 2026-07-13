import { clsx } from "clsx"
import { useEffect, useEffectEvent, useRef, useState } from "react"
import { getTrackBackground, Range } from "react-range"
export default function App() {
    const [frequency, setFrequency] = useState(1000)
    const [isActive, setIsActive] = useState(false)

    const refOscillator = useRef<OscillatorNode>(null)

    const getFrequency = useEffectEvent(() => {
        return frequency
    })
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
            gain: 0.1
        })
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
            }
        }

    }, [isActive])

    useEffect(() => {
        const oscillator = refOscillator.current
        if (oscillator) {
            oscillator.frequency.setValueAtTime(frequency, 0)
        }

    }, [frequency])


    const min = 20
    const max = 20000
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
                <BasicRange value={ Math.log(frequency / min) / Math.log(max / min) } setValue={ (x) => setFrequency(min * (max / min) ** (x)) } />
            </div>
            <output style={ { marginTop: "30px" } } id="output" className={ clsx(
                'font-mono',
            ) }>
                { (frequency).toFixed(3) }
            </output>
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
            <output style={ { marginTop: "30px" } } id="output" className={ clsx(
                'font-mono',
            ) }>
                { (value).toFixed(3) }
            </output>
        </div>
    )
}
