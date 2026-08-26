import { clsx } from "clsx"
import { useEffect, useState } from "react"
import { getTrackBackground, Range } from "react-range"
import useWebSocket, { ReadyState } from "react-use-websocket"
export default function App() {
    const { sendJsonMessage, readyState, getWebSocket, } = useWebSocket<WsRxMessage | null>(
        `ws://192.168.30.130:8808/can-ws`,
        {
            share: false,
            shouldReconnect: () => true,
            reconnectInterval: 500,
            reconnectAttempts: Infinity,
        },
        true
    )

    useEffect(() => {


        const handleWs = (e: MessageEvent) => {
            const wsMessage = JSON.parse(e.data) as WsRxMessage

            // console.log('Got a new json message:', wsMessage)

            // if (wsMessage?.event === '') { }
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
    }, [getWebSocket, readyState,])

    const [position2, setPosition2] = useState(0.5)
    const [position1, setPosition1] = useState(0.5)


    useEffect(() => {
        const centerPosition = 1.3
        const halfRange = 1.0
        sendJsonMessage({
            event: "move",
            data: {
                id: 2,
                position: (position2 - 0.5) / 0.5 * halfRange + centerPosition
            },
        } satisfies WsTxMessage)
    }, [position2, sendJsonMessage])

    useEffect(() => {
        const centerPosition = 1.05
        const halfRange = 0.75
        sendJsonMessage({
            event: "move",
            data: {
                id: 1,
                position: (position1 - 0.5) / 0.5 * halfRange + centerPosition
            },
        } satisfies WsTxMessage)
    }, [position1, sendJsonMessage])

    return (
        <div>
            <div>
                <button onClick={ () => {
                    sendJsonMessage({
                        event: "enable",
                        data: {
                            id: 2,
                        },
                    } satisfies WsTxMessage)
                } }>Enable</button>
                <button onClick={ () => {
                    sendJsonMessage({
                        event: "disable",
                        data: {
                            id: 2,
                        },
                    } satisfies WsTxMessage)
                } }>Disable</button>
                <BasicRange value={ position2 } setValue={ setPosition2 } />
            </div>
            <div>
                <button onClick={ () => {
                    sendJsonMessage({
                        event: "enable",
                        data: {
                            id: 1,
                        },
                    } satisfies WsTxMessage)
                } }>Enable</button>
                <button onClick={ () => {
                    sendJsonMessage({
                        event: "disable",
                        data: {
                            id: 1,
                        },
                    } satisfies WsTxMessage)
                } }>Disable</button>
                <BasicRange value={ position1 } setValue={ setPosition1 } />
            </div>
        </div>
    )
}



type _WsTxEventMap = {
    'enable': {
        id: number
    }
    'disable': {
        id: number
    }

    'move': {
        id: number
        position: number
    }

}

export type WsTxMessage = {
    [K in keyof _WsTxEventMap]: {
        event: K
        data: _WsTxEventMap[K]
    }
}[keyof _WsTxEventMap]

type _WsRxEventMap = {
    NEVER: never
}

export type WsRxMessage = {
    [K in keyof _WsRxEventMap]: {
        event: K
        data: _WsRxEventMap[K]
    }
}[keyof _WsRxEventMap]


const BasicRange: React.FC<{ value: number, setValue: (value: number) => void, name?: string }> = ({ value, setValue, name = "" }) => {
    const STEP = 0.000001
    const MIN = 0
    const MAX = 1
    return (
        <div
            style={ {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
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
                            width: "80%",
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