import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
export default function App() {
    const refDiv1 = useRef<HTMLDivElement>(null!)
    const refDiv2 = useRef<HTMLDivElement>(null!)
    const refCount = useRef<number>(0)
    const refPrevTs = useRef<DOMHighResTimeStamp>(0)
    const [betweenFrame, setBetweenFrame] = useState(0)
    useEffect(() => {
        const elem1 = refDiv1.current
        const elem2 = refDiv2.current
        let rafId: number | null = null
        function updateClock(time: DOMHighResTimeStamp) {
            refCount.current++
            const count = refCount.current % 100
            elem1.innerHTML = new Date().toISOString().split('T')[1].replace('Z', '')
            elem2.innerHTML = '&nbsp;'.repeat((count % 10) * 4 + 3) + count.toString().padStart(2, '0')
            rafId = requestAnimationFrame(updateClock)
            setBetweenFrame(time - refPrevTs.current)
            refPrevTs.current = time
        }
        updateClock(0)
        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId)
            }
        }
    }, [])
    return (
        <div className={ clsx(
            'flex justify-center items-center h-screen w-screen',
        ) }>
            <div id="timer" ref={ refDiv1 } className={ clsx(
                // 'text-[12rem] ',
                'text-[10cqw]',
                'font-mono',
            ) }></div>
            <div ref={ refDiv2 } className={ clsx(
                // 'text-[12rem] ',
                'text-[4cqw] absolute bottom-1/4 left-0',
                'font-mono',
            ) }></div>
            <div className={ clsx(
                // 'text-[12rem] ',
                'text-[1cqw] absolute top-12 left-12',
                'font-mono ',
            ) }>{ (1000 / betweenFrame).toFixed(2).padStart(6, '0') } fps({ betweenFrame.toFixed(3).padStart(6, ' ') }ms)</div>
        </div>
    )
}
