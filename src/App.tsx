import clsx from 'clsx'
import { type LazyExoticComponent, type ReactNode, Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { lazyWithPreload, type PreloadableComponent } from "react-lazy-with-preload"
import { useLocalStorage } from 'usehooks-ts'
import { ErrorBoundary, type FallbackProps, } from "react-error-boundary"
// import App from './test-devtool'
// import App from './components/Slider'
// import App from './try-trpc/try-trpc-client'
// import App from './try-css-absoluteincss'
// import App from './try-vanilla/try02-css-3dtransform'

// import App from './try01-material'
// import App from './try02-fuckingmodules'
// import App from './try03-virtualize'
// import App from './try04-mediaapi'
// import App from './try05-customhook'
// import App from './try06-scrollsnap'
// import App from './try07-dotenv'
// import App from './try08-canvas'
// import App from './try09-colorconsole'
// import App from './try10-svg'
// import App from './try11-historylib'
// import App from './try12-spinner'
// import App from './try13-virtualize-tanstack-example'
// import App from './try14-gesturearea'
// import App from './try15-markdown'
// import App from './try16-audio'
// import App from './try17-virtualize-tanstack'
// import App from './try18-echarts'
/**
 * see https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
 * I must use specific filename pattern
 */
// const appTitlesAndComponents: [string, LazyExoticComponent<() => JSX.Element>][] = [
const appTitlesAndComponents: [string, PreloadableComponent<() => ReactNode>][] = [
    ['-01- material', lazyWithPreload(() => import('./try01-material')),],
    ['-02- fuckingmodules', lazyWithPreload(() => import('./try02-fuckingmodules')),],
    ['-03- virtualize', lazyWithPreload(() => import('./try03-virtualize')),],
    ['-04- mediaapi', lazyWithPreload(() => import('./try04-mediaapi')),],
    ['-05- customhook', lazyWithPreload(() => import('./try05-customhook')),],
    ['-06- scrollsnap', lazyWithPreload(() => import('./try06-scrollsnap')),],
    ['-07- dotenv', lazyWithPreload(() => import('./try07-dotenv')),],
    ['-08- canvas', lazyWithPreload(() => import('./try08-canvas')),],
    ['-09- colorconsole', lazyWithPreload(() => import('./try09-colorconsole')),],
    ['-10- svg', lazyWithPreload(() => import('./try10-svg')),],
    ['-11- historylib', lazyWithPreload(() => import('./try11-historylib')),],
    ['-12- spinner', lazyWithPreload(() => import('./try12-spinner')),],
    ['-13- virtualize-tanstack-example', lazyWithPreload(() => import('./try13-virtualize-tanstack-example')),],
    ['-14- gesturearea', lazyWithPreload(() => import('./try14-gesturearea')),],
    ['-15- markdown', lazyWithPreload(() => import('./try15-markdown')),],
    ['-16- audio', lazyWithPreload(() => import('./try16-audio')),],
    ['-17- virtualize-tanstack', lazyWithPreload(() => import('./try17-virtualize-tanstack')),],
    ['-18- echarts', lazyWithPreload(() => import('./try18-echarts')),],
    ['-19- animate-menu', lazyWithPreload(() => import('./try19-animate-menu')),],
    ['-20- use-gesture', lazyWithPreload(() => import('./try20-use-gesture')),],
    ['-21- react-three-fiber', lazyWithPreload(() => import('./try21-react-three-fiber')),],
    ['-22- jotai-family', lazyWithPreload(() => import('./try22-jotai-family')),],
    ['-23- jotai-query', lazyWithPreload(() => import('./try23-jotai-query')),],
    ['-24- jotai-more', lazyWithPreload(() => import('./try24-jotai-more')),],
    ['-25- debug-backdrop', lazyWithPreload(() => import('./try25-debug-backdrop')),],
    ['-26- virtualize-and-scrollbar', lazyWithPreload(() => import('./try26-virtualize-and-scrollbar')),],
    ['-27- image', lazyWithPreload(() => import('./try27-image.tsx')),],
    ['-28- ebml', lazyWithPreload(() => import('./try28-ebml.tsx')),],
    ['-29- resolve-bookmarks', lazyWithPreload(() => import('./try29-resolve-bookmarks.tsx')),],
    ['-30- colorbanding', lazyWithPreload(() => import('./try30-colorbanding.tsx')),],
    ['-31- worker-inline', lazyWithPreload(() => import('./try31-worker-inline.tsx')),],
    ['-32- floating-ui', lazyWithPreload(() => import('./try32-floatingui.tsx')),],
    ['-33- mantine', lazyWithPreload(() => import('./try33-mantine.tsx')),],
    ['-34- even-flex', lazyWithPreload(() => import('./try34-even-flex.tsx')),],
    ['-35- activitywatch', lazyWithPreload(() => import('./try35-activitywatch.tsx')),],
    ['-36- webrtc', lazyWithPreload(() => import('./try36-webrtc.tsx')),],
    ['calc', lazyWithPreload(() => import('./tools/minecraft-exp-calculator')),],
    ['qbit-batch-mv', lazyWithPreload(() => import('./tools/qbit-batch-mv')),],
    ['checkout-calculator', lazyWithPreload(() => import('./tools/checkout-calculator')),],
    ['Slider', lazyWithPreload(() => import('./components/Slider')),],
    ['vanilla-01-css-absoluteincss', lazyWithPreload(() => import('./try-vanilla/try01-css-absoluteincss')),],
    ['vanilla-02-css-3dtransform', lazyWithPreload(() => import('./try-vanilla/try02-css-3dtransform')),],
    ['vanilla-03-draggable', lazyWithPreload(() => import('./try-vanilla/try03-draggable.tsx')),],
    ['vanilla-04-css-blend', lazyWithPreload(() => import('./try-vanilla/try04-css-blend.tsx')),],
    ['vanilla-05-apple-fullscreen', lazyWithPreload(() => import('./try-vanilla/try05-apple-fullscreen.tsx')),],
]
// const Apps = appTitlesAndComponents.map((appPath) =>
//     lazyWithPreload(() => import(`./try${appPath}.tsx`))
// )

/**
 * its react.lazy itself has some delay (~500ms) (so it is called 'lazy')
 * even the promise is resolved immediately
 */
const TryLazy = lazy(() => import('./try01-material'))

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    // console.log((error as Error).stack?.split('\n'))
    return (
        <div className="relative p-4 m-4 w-2/3  bg-red-500 flex flex-col justify-center rounded items-center ">
            <div className=" pb-4 font-bold text-lg">ERROR</div>
            <button onClick={ resetErrorBoundary } className="absolute top-2 right-4 ">RETRY</button>
            <div className="p-4 font-mono bg-black text-red-500 rounded #whitespace-nowrap" >{
                (error as Error).stack
                    ?.split('\n')
                    .map((item) => (<div key={ item }>{ item }</div>))
            }</div>
        </div>
    )
}

export default function App() {
    const refNavigationPanel = useRef<HTMLDivElement>(null)

    const [currentAppIndex, setCurrentAppIndex] = useLocalStorage('currentAppIndex', 0)
    const [isShowPanel, setIsShowPanel] = useLocalStorage('isShowPanel', true)

    const CurrentApp = appTitlesAndComponents[currentAppIndex]?.[1]
        ?? (() => <div className="text-red-400 text-3xl">!! No such component !!</div>)
    const Panel = <>
        <div
            onClick={ () => {
                setIsShowPanel((x) => (!x))
            } }
            className={ clsx(
                '',
                /* if no top-0, fixed elements' position will be unexpected */
                'z-[99999] fixed top-1 right-1 h-8 w-8 flex justify-center items-center',
                'rounded',
                'hover:bg-white/10 active:bg-white/5',
                'select-none font-bold font-mono'
            ) }
        >{ isShowPanel ? '>' : '<' }</div>
        { isShowPanel &&
            <div className={ clsx(
                'navigationPanel',
                'z-[99999] mr-1 p-1  fixed right-0 top-10 max-h-[calc(100vh_-_52px)] overflow-y-auto',
                'outline outline-white/30 bg-black/30 rounded',
                'select-none font-bold font-mono',
            ) } ref={ refNavigationPanel }>
                { appTitlesAndComponents.map((appTitleAndComponent, i) => <div
                    key={ i }
                    className={ clsx(
                        'rounded p-1',
                        'hover:bg-white/10 active:bg-white/5',
                        currentAppIndex === i && 'outline outline-lime-300 text-lime-300'
                    ) }
                    onPointerDown={ () => {
                        setCurrentAppIndex(i)
                    } }
                    onPointerEnter={ (e) => {
                        appTitleAndComponent[1].preload()
                        if (e.buttons === 1) {
                            setCurrentAppIndex(i)
                        }
                    } }
                >{ appTitleAndComponent[0] }</div>
                ) }
            </div> }

    </>

    // useEffect(() => {
    //     appTitlesAndComponents.forEach((appTitleAndComponent, i) => {
    //         appTitleAndComponent[1].preload()
    //     })
    // }, [])

    useLayoutEffect(() => {
        refNavigationPanel.current?.scrollTo({ top: 32 * currentAppIndex - 100 })
    }, [isShowPanel])
    return (
        <>
            { Panel }
            <ErrorBoundary FallbackComponent={ ErrorFallback } resetKeys={ [currentAppIndex] }>
                <Suspense fallback={
                    <div className="rounded bg-green-600 p-4 fixed left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Lazy Loading Components...
                    </div>
                }>
                    <CurrentApp></CurrentApp>
                    {/* <TryLazy></TryLazy> */ }
                </Suspense>
            </ErrorBoundary>
        </>
    )
}

