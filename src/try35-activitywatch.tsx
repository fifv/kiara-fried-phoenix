import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { format } from 'date-fns'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { random } from "lodash-es"


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
    const refDivRef = useRef<HTMLDivElement>(null)
    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => refDivRef.current,
        estimateSize: () => 24,
    })

    useEffect(() => {
        const url = (() => {
            // const url = new URL('http://localhost:5600/api/0/buckets/aw-watcher-window_Fifv-ThinkBook/events')
            const url = new URL('http://localhost:5600/api/0/buckets/aw-watcher-window_Fifv-loating/events')
            // url.searchParams.set('start', new Date('2026-01-01T13:56:55+08:00').toISOString())
            // url.searchParams.set('end', new Date('2026-02-01T17:56:55+08:00').toISOString())
            const end = new Date()
            const start = new Date(end.getTime() - 900 * 24 * 3600 * 1000) 
            url.searchParams.set('start', start.toISOString())
            url.searchParams.set('end', end.toISOString())
            url.searchParams.set('limit', '-1')
            return url
        })()
        // const url = `http://localhost:5600/api/0/buckets/aw-watcher-window_Fifv-ThinkBook/events?start=${encodeURIComponent()}&end=${encodeURIComponent('2026-02-01T17:56:55+08:00')}&limit=-1`
        console.log(url)
        try {
            fetch(url).then(async (data) => {
                if (data.ok) {
                    try {
                        const d = await data.json()
                        console.log(d)
                        setData(d)
                    } catch (error) {
                        console.log(error)
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
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

            <div>
                <ProfileChart bucketData={ data } minTime={ +new Date() - 9 * 24 * 3600 * 1000 } />
            </div>

            <div className={ clsx(
                'AllData h-[80vh] overflow-auto',
            ) } ref={ refDivRef }>
                {/* The large inner element to hold all of the items */ }
                <div
                    className={ clsx(

                        'relative w-full', /* ported from example */
                    ) }
                    style={ {
                        height: `${rowVirtualizer.getTotalSize()}px`,
                    } }
                >
                    {/* Only the visible items in the virtualizer, manually positioned to be in view */ }
                    { rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const datum = data[virtualItem.index]
                        return (
                            <div className={ clsx(
                                'flex gap-4',
                                'absolute top-0 left-0 w-full', /* ported from example */
                            ) }
                                key={ virtualItem.key }
                                style={ {
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                } }
                            >
                                <div className="w-24 shrink-0">{ datum.id }</div>
                                <div className="w-12 shrink-0">{ datum.duration.toFixed(2) }</div>
                                <div className="">{ format(new Date(datum.timestamp), 'yyyy/MM/dd kk:mm:ss (xxx)') }</div>
                                <div className="w-48 shrink-0">{ datum.data.app }</div>
                                <div className="">{ datum.data.title }</div>
                            </div>
                        )
                    }) }
                </div>
            </div>
        </div>
    )
}




function ProfileChart({ bucketData, minTime }: {
    bucketData: BucketData[]
    minTime: number
}) {
    interface DataItem {
        name: string
        value: number[]
        itemStyle: {
            normal: {
                color: string
            }
        }
    }

    // Generate data once on component mount
    const { data, categories } = useMemo(() => {
        const categories = ['categoryA', 'categoryB', 'categoryC']
        const randomColor = [
            '#7b9ce1',
            '#bd6d6c',
            '#75d874',
            '#e0bc78',
            '#dc77dc',
        ]
        const types = [
            { name: 'JS Heap', color: '#7b9ce1' },
            { name: 'Documents', color: '#bd6d6c' },
            { name: 'Nodes', color: '#75d874' },
            { name: 'Listeners', color: '#e0bc78' },
            { name: 'GPU Memory', color: '#dc77dc' },
            { name: 'GPU', color: '#72b362' },
        ]

        const data: DataItem[] = []

        categories.forEach((category, index) => {
        })
        for (let i = 0; i < bucketData.length; i++) {
            const typeItem = { name: bucketData[i].data.title, color: randomColor[random(randomColor.length)] }
            const duration = bucketData[i].duration

            data.push({
                name: typeItem.name,
                value: [0, +new Date(bucketData[i].timestamp), (+new Date(bucketData[i].timestamp) + duration * 1000), duration * 1000],
                itemStyle: {
                    normal: {
                        color: typeItem.color,
                    },
                },
            })
        }

        return { data, categories }
    }, [])

    // Custom render function for the Gantt/Profile blocks
    const renderItem: echarts.CustomSeriesRenderItem = (params, api) => {
        const categoryIndex = api.value(0)
        // map the start/end time (index 1 and 2) to coordinates
        const start = api.coord([api.value(1), categoryIndex])
        const end = api.coord([api.value(2), categoryIndex])

        // set height relative to the category bar height
        // @ts-ignore: api.size is valid in custom series context
        const height = api.size([0, 1])[1] * 0.6

        const rectShape = echarts.graphic.clipRectByRect(
            {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height,
            },
            {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height,
            }
        )

        return (
            rectShape && {
                type: 'rect',
                transition: ['shape'],
                shape: rectShape,
                style: api.style(),
            }
        )
    }

    const option: echarts.EChartsOption = {
        tooltip: {
            formatter: (params) => {
                return params.marker + params.name + ': ' + params.value[3] + ' ms'
            },
        },
        title: {
            text: 'Profile',
            left: 'center',
        },
        dataZoom: [
            {
                type: 'slider',
                filterMode: 'weakFilter',
                showDataShadow: false,
                top: 400,
                labelFormatter: '',
            },
            {
                type: 'inside',
                filterMode: 'weakFilter',
            },
        ],
        grid: {
            height: 300,
        },
        xAxis: {
            min: minTime,
            scale: true,
            axisLabel: {
                formatter: (val: number) => {
                    return Math.max(0, val - minTime) + ' ms' 
                },
            },
        },
        yAxis: {
            data: categories,
        },
        series: [
            {
                type: 'custom',
                renderItem: renderItem,
                itemStyle: {
                    opacity: 0.8,
                },
                encode: {
                    x: [1, 2],
                    y: 0,
                },
                data: data,
            },
        ],
    }

    return (
        <div>
            <ReactECharts
                option={ option }
                style={ { height: '500px', width: '100%' } }
            />
        </div>
    )
}