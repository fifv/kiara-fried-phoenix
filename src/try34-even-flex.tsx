import clsx from "clsx"
import { useState } from "react"
export default function App() {
    const [count, setCount] = useState(0)
    return (
        <>
            <div className="px-32 py-8">
                evenly, no grow, 
                <div className={ clsx(
                    'OutBox h-32 outline flex p-2  justify-evenly',
                ) }>
                    <div className="h-full outline outline-red-500 basis-0">asdfasdfasdfasdfasddsafsdfasdfasdfadfasfasfafasdfasdfasdfasdfasdfasdf</div>
                    <div className="h-full outline outline-red-500 basis-0">1</div>
                </div>
            </div>
            <div className="px-32 py-8">
                grow, basis-0, 
                <div className={ clsx(
                    'OutBox h-32 outline flex p-2  justify-between',
                ) }>
                    <div className="h-full outline outline-red-500 grow basis-0">asdfasddfsdfsdfsdfasdfadfasfasfafasdfasdfasdfasdfasdfasdf</div>
                    <div className="h-full outline outline-red-500 grow basis-0"></div>
                </div>
            </div>
            <div className="px-32 py-8">
                grow, basis-0, min-w-0
                <div className={ clsx(
                    'OutBox h-32 outline flex p-2  justify-between',
                ) }>
                    <div className="h-full outline outline-red-500 grow shrink- basis-0 min-w-0">asdfasddfsdfsdfsdfasfasdfasdfafasdfsadfadfasfasfafasdfasdfasdfasdfasdfasdf</div>
                    <div className="h-full outline outline-red-500 grow shrink- basis-0 min-w-0"></div>
                </div>
            </div>
        </>
    )
}
