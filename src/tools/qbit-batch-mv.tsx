import clsx from "clsx"
import { useEffect, useState } from "react"
import { useLocalStorage } from "usehooks-ts"
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
const queryClient = new QueryClient()
interface Torrent {
    added_on: number
    amount_left: number
    auto_tmm: boolean
    availability: number
    category: string
    completed: number
    completion_on: number
    content_path: string
    dl_limit: number
    dlspeed: number
    download_path: string
    downloaded: number
    downloaded_session: number
    eta: number
    f_l_piece_prio: boolean
    force_start: boolean
    infohash_v1: string
    infohash_v2: string
    last_activity: number
    magnet_uri: string
    max_ratio: number
    max_seeding_time: number
    name: string
    num_complete: number
    num_incomplete: number
    num_leechs: number
    num_seeds: number
    priority: number
    progress: number
    ratio: number
    ratio_limit: number
    save_path: string
    seeding_time: number
    seeding_time_limit: number
    seen_complete: number
    seq_dl: boolean
    size: number
    state: string
    super_seeding: boolean
    tags: string
    time_active: number
    total_size: number
    tracker: string
    trackers_count: number
    up_limit: number
    uploaded: number
    uploaded_session: number
    upspeed: 0
}
interface Change {
    hashes: string
    name: string
    location: string
}
function Main() {
    const [changes, setChanges] = useLocalStorage<Change[]>('qbit-batch-mv/changes', [])
    const { isFetching, error, data: torrents = [] } = useQuery<Torrent[]>({
        queryKey: ['torrents'],
        queryFn: async () => {
            const qbitData = await (await fetch(
                'https://fifv.me:55000/qbittorrent/api/v2/sync/maindata',
                {
                    method: "GET",
                    // credentials: 'include',
                }
            )).json()
            console.log(qbitData)
            const newTorrents = Object.values(qbitData.torrents as Torrent[]).filter((torrent, i) => {
                return (
                    torrent.save_path.startsWith('/media/BitTorrentDownload')
                    && !torrent.name.match(/(\d巻)|(月号)|(画集)|(全巻)/)
                )
            })

            newTorrents.forEach((torrent, i) => {
                // console.log(`-${(i + 1).toString().padStart(3, '0')}-`, torrent.name, torrent.save_path)
                // console.log(torrent)
            })
            return newTorrents
        },

    })
    return (
        <div className="font-mono text-sm">
            {
                isFetching &&
                <div className="fixed top-0 left-0 h-5 w-5 m-2">
                    <svg className="animate-spin   text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            }
            {
                torrents.map((torrent, i) => {
                    const modifiedPath = changes.find((change) => change.hashes === torrent.infohash_v1)?.location
                    const isModified = !!modifiedPath /* && modifiedPath !== torrent.save_path */
                    return (
                        <div className="flex items-center gap-2 m-2 w-1/2" key={ torrent.infohash_v1 } id={ torrent.infohash_v1 }>
                            <div>
                                { `-${(i + 1).toString().padStart(3, '0')}-` }
                            </div>
                            <div className="flex flex-col w-full">
                                <div className="font-bold text-green-300">
                                    { torrent.name }
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className={ clsx(
                                        isModified && 'line-through text-red-400',
                                        'text-xs ',
                                        !isModified && 'text-white/60',
                                    ) }>
                                        { torrent.save_path }
                                    </div>
                                    <div className={ clsx(
                                        /* isModified && */ 'text-white/20',
                                    ) }>
                                        { '>' }
                                    </div>
                                    <input
                                        className={ clsx(
                                            'p-1 rounded border border-slate-200/20 bg-transparent w-1/2',
                                            isModified && 'text-green-500',
                                        ) }
                                        spellCheck={ false }
                                        value={ modifiedPath ?? torrent.save_path }
                                        onChange={ (e) => {
                                            const entryIndex = changes.findIndex((change) => change.hashes === torrent.infohash_v1)
                                            if (e.currentTarget.value === torrent.save_path) {
                                                if (entryIndex !== -1) {
                                                    changes.splice(entryIndex)
                                                    setChanges(changes)
                                                }
                                            } else {
                                                const newChange = {
                                                    hashes: torrent.infohash_v1,
                                                    name: torrent.name,
                                                    location: e.currentTarget.value,
                                                }

                                                if (entryIndex === -1) {
                                                    setChanges([
                                                        ...changes,
                                                        newChange
                                                    ])
                                                } else {
                                                    changes[entryIndex] = newChange
                                                    setChanges(changes)
                                                }
                                            }

                                        } }></input>
                                    <button className="m-0 px-2 py-1" onClick={ () => {
                                        const entryIndex = changes.findIndex((change) => change.hashes === torrent.infohash_v1)

                                        const newChange = {
                                            hashes: torrent.infohash_v1,
                                            name: torrent.name,
                                            location: '/media/fuserdata/Anime/',
                                        }

                                        if (entryIndex === -1) {
                                            setChanges([
                                                ...changes,
                                                newChange
                                            ])
                                        } else {
                                            changes[entryIndex] = newChange
                                            setChanges(changes)
                                        }

                                    } }>1</button>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
            <div className={ clsx(
                'bg-slate-600 fixed right-8 top-0 rounded m-2 max-w-[40%]',
            ) }>
                {
                    changes.map((change, i) => {
                        return (
                            <div key={ change.hashes } className="relative p-2" onClick={ () => {
                                document.getElementById(change.hashes)?.scrollIntoView({ block: "center", })
                                document.getElementById(change.hashes)?.animate([
                                    {
                                        outline: 'solid red 4px',
                                        borderRadius: '4px',
                                    },
                                    {
                                        outline: 'solid transparent 4px',
                                    }
                                ], { duration: 1500, fill: "none", })
                            } }>
                                <div>{ change.hashes }</div>
                                <div>{ change.name }</div>
                                <div>{ change.location }</div>
                                <button className="absolute right-0 top-0" onClick={ () => {
                                    changes.splice(i, 1)
                                    setChanges(changes)
                                } }>X</button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={ queryClient }>
            <Main />
            <ReactQueryDevtools initialIsOpen={ false } />
        </QueryClientProvider>
    )
}