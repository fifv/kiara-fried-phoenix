import { isEqual, range } from "lodash-es"
import { useEffect, useState } from "react"
import { selectAtom } from 'jotai/utils'
import { atomFamily } from 'jotai-family'
import { atom, useAtom, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { DevTools as JotaiDevTools } from 'jotai-devtools'
import jotaiDevToolsCss from 'jotai-devtools/styles.css?inline'

import clsx from "clsx"
const currentIdAtom = atom(13)
const idFamily = atomFamily(
    (id: number) =>
        // atom(id.toString().padStart(2, '0') + 'aaa')
        atomWithStorage(id + 'aaa', id.toString().padStart(2, '0') + 'aaa')
    , isEqual
)
const isCurrentFamily = atomFamily(
    (id: number) =>
        atom(
            (get) => get(currentIdAtom) === id,
            (get, set,) => {
                set(currentIdAtom, id)
            }
        ),
)
const aAtom = atom(true)
const bAtom = atom(
    (get) => {
        return get(aAtom)
    }
)
const cAtom = atom(
    (get) => {
        return { status: get(aAtom) }
    }
)
const dAtom = selectAtom(
    aAtom,
    (a) => {
        return { status: a }
    },
    (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b)
        // return a.status === b.status
    }
)
/**
 * 除非get(someAtom)的這個someAtom變了,不然這整個getter是不會重複執行的
 */
const eAtom = atom(
    (get) => {
        // get(aAtom)
        console.time('loooong operation')
        for (let i = 0; i < 1000000000; i++) {
            const aaaa = 111 ** 23
        }
        console.timeEnd('loooong operation')
        return 'oh yeah!'
    }
)
function TestJotaiControl() {
    console.log('')
    console.log('render: TestJotaiControl')
    const [a, setA] = useAtom(aAtom)
    return (
        <div className={ clsx(
            'select-none',
            'hover:bg-white/10 active:bg-white/5',
        ) }
            onClick={ () => {
                setA((x) => (!x))
            } }
        >a: { JSON.stringify(a) }</div>
    )
}
function TestJotaiPrimitive() {
    console.log('render: TestJotaiPrimitive')
    const [b, setB] = useAtom(bAtom)
    return (
        <div className={ clsx(
        ) }
        >b: { JSON.stringify(b) }</div>
    )
}
function TestJotaiObject() {
    console.log('render: TestJotaiObject')
    const [c, setC] = useAtom(cAtom)
    return (
        <div className={ clsx(
        ) }
        >c: { JSON.stringify(c) }</div>
    )
}
function TestJotaiSelect() {
    console.log('render: TestJotaiSelect')
    const [d, setD] = useAtom(dAtom)
    return (
        <div className={ clsx(
        ) }
            onClick={ () => {
                // setD()
            } }
        >d: { JSON.stringify(d) }</div>
    )
}
function TestJotaiMemo() {
    console.log('render: TestJotaiMemo')
    const [e, setE] = useAtom(eAtom)
    return (
        <div className={ clsx(
        ) }
            onClick={ () => {
                // setD()
            } }
        >{ e }</div>
    )
}


function TestJotai() {
    return <>
        <TestJotaiControl></TestJotaiControl>
        <TestJotaiPrimitive></TestJotaiPrimitive>
        <TestJotaiObject></TestJotaiObject>
        <TestJotaiSelect></TestJotaiSelect>
        {/* <TestJotaiMemo></TestJotaiMemo> */ }
    </>
}
export default function App() {

    return (
        <>
            <TestJotai></TestJotai>
            <div className={ clsx(
                'select-none font-mono font-bold ',
            ) }>
                {
                    range(300).map((i) =>
                        <Item id={ i } key={ i }></Item>
                    )
                }
            </div>
            {
                process.env.NODE_ENV !== 'production' ? (
                    <>
                        <style>{ jotaiDevToolsCss }</style>
                        <JotaiDevTools></JotaiDevTools>
                    </>
                ) : null
            }

        </>
    )
}
function Item({ id }: {
    id: number
}) {
    console.log('------render------')
    const [count, setCount] = useState(0)
    const [text, setText] = useAtom(idFamily(id))
    /**
     * HURRAY!!!
     * 用useSetAtom,就不需要currentId了,从全部render变成了2个render
     */
    const setCurrentId = useSetAtom(currentIdAtom)
    const [isCurrent, setCurrent] = useAtom(isCurrentFamily(id))
    useEffect(() => {
        console.log('setText changed')
    }, [setText])

    return (
        <div className={ clsx(
            'hover:bg-white/10 active:bg-white/5',
            isCurrent && 'text-green-500'
        ) } onPointerDown={ (e) => {
            if (e.buttons === 1) {
                setText((text) => text + '!')
            } else if (e.buttons === 2) {
                setText((text) => text.replace(/!$/, ''))
            }
            // setCurrentId(id)
            setCurrent()
        } }
            onContextMenu={ (e) => {
                e.preventDefault()
            } }
            onPointerEnter={ (e) => {
                if (e.buttons === 1) {
                    setText((text) => text + '!')
                } else if (e.buttons === 2) {
                    setText((text) => text.replace(/!$/, ''))
                }
                if (e.buttons >= 1) {
                    setCurrent()
                }
            } }
        >{ text }</div>
    )
}
