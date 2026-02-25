import { useEffect, useMemo, useRef, useState } from "react"
import * as echarts from 'echarts'
import clsx from "clsx"
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
export default function App() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (refChart.current) {
            const myChart = echarts.init(refChart.current, 'dark')
            myChart.setOption({
                title: {
                    text: 'Accumulated Waterfall Chart'
                },
                tooltip: {
                    trigger: 'item',
                    axisPointer: {
                        type: 'shadow'
                    },
                    // formatter: function (params: any) {
                    //     let tar
                    //     if (params[1] && params[1].value !== '-') {
                    //         tar = params[1]
                    //     } else {
                    //         tar = params[2]
                    //     }
                    //     return tar && tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value
                    // }
                },
                legend: {
                    data: ['Expenses', 'Income']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                yAxis: {
                    type: 'category',
                    data: (function () {
                        let list = []
                        for (let i = 1; i <= 11; i++) {
                            list.push('Nov ' + i)
                        }
                        return list
                    })()
                },
                xAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'Placeholder',
                        type: 'bar',
                        stack: 'Total',
                        silent: true,
                        itemStyle: {
                            borderColor: 'transparent',
                            color: 'transparent'
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: 'transparent',
                                color: 'transparent'
                            }
                        },
                        data: [0, 900, 1245, 1530, 1376, 1376, 1511, 1689, 1856, 1495, 1292]
                    },
                    {
                        name: 'Income',
                        type: 'bar',
                        stack: 'Total',
                        label: {
                            show: true,
                            position: 'top'
                        },
                        data: [900, 345, 393, '-', '-', 135, 178, 286, '-', '-', '-']
                    },
                    {
                        name: 'Expenses',
                        type: 'bar',
                        stack: 'Total',
                        label: {
                            show: true,
                            position: 'bottom'
                        },
                        data: [100, '-', '-', 108, 154, '-', '-', '-', 119, 361, 203]
                    },
                    {
                        name: 'Expenses78',
                        type: 'bar',
                        stack: 'Total',
                        label: {
                            show: true,
                            position: 'bottom'
                        },
                        data: [200, '-', '-', 108, 154, '-', '-', '-', 119, 361, 203]
                    },
                    {
                        name: 'Expenses8',
                        type: 'bar',
                        stack: 'Total',
                        label: {
                            show: true,
                            position: 'bottom'
                        },
                        data: [300, '-', '-', 108, 154, '-', '-', '-', 119, 361, 203]
                    },
                ]
            }

            )
        }
    }, [])

    const refChart = useRef<HTMLDivElement>(null)
    return (
        <div>
            234
            <div id="mychart" ref={ refChart } className={ clsx(
                'w-1/2 h-96',
            ) }>wef</div>
            erg
            <div className="w-2/3">
                <ProfileChart />
            </div>
        </div>
    )
}



function ProfileChart() {
    // Generate data once on component mount
    const { data, startTime, categories } = useMemo(() => {
        const categories = ['categoryA', 'categoryB', 'categoryC']
        const types = [
            { name: 'JS Heap', color: '#7b9ce1' },
            { name: 'Documents', color: '#bd6d6c' },
            { name: 'Nodes', color: '#75d874' },
            { name: 'Listeners', color: '#e0bc78' },
            { name: 'GPU Memory', color: '#dc77dc' },
            { name: 'GPU', color: '#72b362' },
        ]
        interface DataItem {
            name: string
            value: number[]
            itemStyle: {
                normal: {
                    color: string
                }
            }
        }
        const data: DataItem[] = []
        const dataCount = 10
        const startTime = +new Date()

        categories.forEach((category, index) => {
            let baseTime = startTime
            for (let i = 0; i < dataCount; i++) {
                const typeItem = types[Math.round(Math.random() * (types.length - 1))]
                const duration = Math.round(Math.random() * 10000)

                data.push({
                    name: typeItem.name,
                    value: [index, baseTime, (baseTime += duration), duration],
                    itemStyle: {
                        normal: {
                            color: typeItem.color,
                        },
                    },
                })

                baseTime += Math.round(Math.random() * 2000)
            }
        })

        return { data, startTime, categories }
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

    const option = {
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
            min: startTime,
            scale: true,
            axisLabel: {
                formatter: (val: number) => {
                    return Math.max(0, val - startTime) + ' ms'
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
    } satisfies EChartsOption

    return (
        <div>
            <ReactECharts
                option={ option }
                style={ { height: '500px', width: '100%' } } />
        </div>
    )
}