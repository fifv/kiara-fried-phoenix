import { useState } from "react"
import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import { range } from "lodash-es"
import { clsx } from "clsx"
export default function App() {
    return (<>
        <div className={ clsx(
            'w-96 h-96 outline m-12 overflow-auto relative',
        ) }>
            <div className="h-24 w-160 bg-amber-800 "></div>
            <div className="flex flex-nowrap">
                <div className="w-36 bg-blue-800"></div>
                <ButtonWithTooltip />
            </div>
            <div className="h-96 bg-amber-800"></div>
        </div>
    </>)

}

function ButtonWithTooltip() {
    const [count, setCount] = useState(0)
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
    const {
        refs: { setReference, setFloating },
        floatingStyles,
        middlewareData,
        placement,
    } = useFloating({
        whileElementsMounted: autoUpdate,
        placement: "top",
        middleware: [
            offset(6),
            flip(),
            shift({ padding: 5 }),
            arrow({ element: arrowElement })
        ]
    })

    const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[placement.split("-")[0]]!

    return (
        <div className={ clsx(
            ' outline-red-400 relative',
        ) }>
            <button ref={ setReference } className="">Me</button>
            <div ref={ setFloating } style={ floatingStyles } className="w-max max-w-72">
                what's this? Good Morning!
                <div ref={ setArrowElement } className={ clsx(
                    'Arrow absolute bg-red-400 w-1 h-1',
                ) } style={ {
                    // [placement]: middlewareData.arrow?.x,
                    // [placement]: middlewareData.arrow?.y,
                    'left': middlewareData.arrow?.x,
                    'top': middlewareData.arrow?.y,
                    [staticSide]: `${-0}px`
                } }></div>
            </div>
        </div>
    )
}
