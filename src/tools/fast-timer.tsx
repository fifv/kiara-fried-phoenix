import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
export default function App() {
    const refDivRef = useRef<HTMLDivElement>(null!)
    useEffect(() => {
        const elem = refDivRef.current
        let rafId: number | null = null
        function updateClock() {
            elem.innerHTML = new Date().toISOString().split('T')[1].replace('Z', '')
            rafId = requestAnimationFrame(updateClock)
        }
        updateClock()
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
            <div id="timer" ref={ refDivRef } className={ clsx(
                // 'text-[12rem] ',
                'text-[10cqw]',
                'font-mono',
            ) }></div>
        </div>
    )
}
