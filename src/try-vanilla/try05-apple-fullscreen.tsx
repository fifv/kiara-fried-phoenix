import { clsx } from "clsx"
import { useRef, useState } from "react"
export default function App() {
    const [count, setCount] = useState(0)
    const refDivRef = useRef<HTMLDivElement>(null!)
    const refVideoElem = useRef<HTMLVideoElement>(null!)
    return (
        <div>

            <div className={ clsx(
                'TheVideoWrapper outline outline-red-400 relative',
            ) } ref={ refDivRef }>
                <video controls ref={ refVideoElem } src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" className={ clsx(
                    'bg-blue-400',
                ) }></video>
                <div className={ clsx(
                    'SomeOverlay  bg-yellow-300 absolute top-0',
                ) } >Some Overlay</div>

            </div>

            <button onClick={ () => {
                refDivRef.current.requestFullscreen()
                // refDivRef.current.webkitEnterFullscreen()
            } }>requestFullscreen</button>
            <button onClick={ () => {
                // refDivRef.current.requestFullscreen()
                // refDivRef.current.webkitEnterFullscreen()
                refDivRef.current.webkitEnterFullscreen()
            } }>webkitEnterFullscreen</button>

            <button onClick={ () => {
                refVideoElem.current.requestFullscreen()
                // refDivRef.current.webkitEnterFullscreen()
            } }>Video: requestFullscreen</button>
            <button onClick={ () => {
                // refDivRef.current.requestFullscreen()
                // refDivRef.current.webkitEnterFullscreen()
                refVideoElem.current.webkitEnterFullscreen()
            } }>Video: webkitEnterFullscreen</button>
        </div>
    )
}
