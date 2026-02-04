import clsx from "clsx"
import { useEffect, useState } from "react"

interface BucketData {
    id: number,
    timestamp: string,
    duration: number,
    data: {
        app: string,
        title: string
    }
}
export default function App() {
    const [data, setData] = useState<BucketData[]>([])
    useEffect(() => {
        const url = (() => {
            const url = new URL('http://localhost:5600/api/0/buckets/aw-watcher-window_Fifv-ThinkBook/events')
            url.searchParams.set('start', new Date('2026-01-01T13:56:55+08:00').toISOString())
            url.searchParams.set('end', new Date('2026-02-01T17:56:55+08:00').toISOString())
            url.searchParams.set('limit', '-1')
            return url
        })()
        // const url = `http://localhost:5600/api/0/buckets/aw-watcher-window_Fifv-ThinkBook/events?start=${encodeURIComponent()}&end=${encodeURIComponent('2026-02-01T17:56:55+08:00')}&limit=-1`
        console.log(url)
        fetch(url).then(async (data) => {
            const d = await data.json()
            console.log(d)
            setData(d)
        })
    }, [])
    return (
        <div className={ clsx(
            'p-8',
        ) }>
            <div>
                ActiwitchWatch
            </div>
            <div>
                { data.length }
            </div>
            {
                data.slice(0,100).map((datum) => <div className={ clsx(
                    'flex gap-4',
                ) }>
                    <div className="w-24 shrink-0">{ datum.id }</div>
                    <div className="w-12 shrink-0">{ datum.duration.toFixed(2) }</div>
                    <div className="">{ datum.timestamp }</div>
                    <div className="w-48 shrink-0">{ datum.data.app }</div>
                    <div className="">{ datum.data.title }</div>
                </div>)
            }
        </div>
    )
}
