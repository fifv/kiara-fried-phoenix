import { Component, useEffect, useRef, useState } from "react"
import type { } from 'react/experimental'
import { useEffectEvent } from 'react'
import chalk from "chalk"
import log from "loglevel"

export default function App() {
    const [count, setCount] = useState(0)
    const [videoUrl, setVideoUrl] = useState('')
    return (
        <>
            <button onClick={ () => { setVideoUrl("https://fifv.me:55000/api/file/Rushia%20Ch.%20%E6%BD%A4%E7%BE%BD%E3%82%8B%E3%81%97%E3%81%82/Membership%20Streams/[20210504]%20%E3%80%90%E6%AD%8C%E6%9E%A0_song%E3%80%91%E6%B7%B1%E5%A4%9C%E3%81%AE%E6%AD%8C%E6%9E%A0%E3%83%BB%E3%83%BB%E3%83%BB%EF%BC%81%EF%BC%81%EF%BC%81%E3%80%90%E6%BD%A4%E7%BE%BD%E3%82%8B%E3%81%97%E3%81%82_%E3%83%9B%E3%83%AD%E3%83%A9%E3%82%A4%E3%83%96%E3%80%91(01JtCTIdggo).mp4") } }>src: Rushia</button>
            <button onClick={ () => { setVideoUrl("https://fifv.me:55000/api/file/%E8%8A%A6%E6%BE%A4%E3%82%B5%E3%82%AD/cover/[20201015]%E5%BF%83%E7%B5%B5%20(kokoroe)%20-%20%E3%83%AD%E3%83%BC%E3%83%89%E3%82%AA%E3%83%96%E3%83%A1%E3%82%B8%E3%83%A3%E3%83%BC%20_%20covered%20by%20%E8%8A%A6%E6%BE%A4%20%E3%82%B5%E3%82%AD-Nn-9VuX7JG0.webm") } }>src: Saki</button>
            <button onClick={ () => { setVideoUrl("./media/test.mkv") } }>src: test.mkv</button>
            <button onClick={ () => { setVideoUrl("./media/test-avc.mp4") } }>src: test-avc.mp4</button>
            <button onClick={ () => { setVideoUrl("./media/test.mkv.webm") } }>src: test.mkv.webm</button>
            <button onClick={ () => { setVideoUrl("./media/test-av1.mkv") } }>src: test-av1.mkv</button>
            <button onClick={ () => { setVideoUrl("./media/test-av1.webm") } }>src: test-av1.webm</button>
            <button onClick={ () => { setVideoUrl("./media/test-hevc.mkv") } }>src: test-hevc.mkv</button>
            <button onClick={ () => { setVideoUrl("./media/test-hevc.mp4") } }>src: test-hevc.mp4</button>
            <button onClick={ () => { setVideoUrl("./media/test-hvc1.mp4") } }>src: test-hvc1.mp4</button>
            <button onClick={ () => { setVideoUrl("./media/test-hev1.mp4") } }>src: test-hev1.mp4</button>
            <Player
                videoUrl={ videoUrl }
                startTimeSeconds={ videoUrl.includes('Rushia') ? 1000 : 100 }
                autoPlayIfUrlChange={ true }
            />
        </>
    )
}
function reportWatch(videoId: string, playedSeconds: number) {
    console.log(chalk.cyan('****reportWatch****', videoId, playedSeconds))
}
/**
 * everything happened when coding this player, is two-way-binding-sync between video-state and react-state
 * when change react value, video need to be change
 * when video change something, react need change reponsively 
 * 
 * react<-video: event-handler
 * react->video: useEffect
 * 
 * state: video<->react
 * - !paused			<->	 		isPlaying
 * - currentTime 		<-> 		playedSeconds
 * - duration 			 ->			duration
 * ( ^^^^^^^^ this shouldn't be changed through react)
 * - src 				<-			videoUrl(props)
 * - volume 			<->			volume
 * - muted 				<->			isMuted
 * - 
 * 
 */
export function Player({ videoUrl, startTimeSeconds, autoPlayIfUrlChange }: {
    videoUrl: string,
    startTimeSeconds: number,
    autoPlayIfUrlChange: boolean,
}) {
    console.log(chalk.magenta('* render'))


    const [count, setCount] = useState(0)
    const [duration, setDuration] = useState(0)
    const [playedSeconds, setPlayedSeconds] = useState(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [isMuted, setIsMuted] = useState(true)
    /* 0~1 */
    const [volume, setVolume] = useState(0.2)

    const refVideo = useRef<HTMLVideoElement>(null)



    useEffect(() => {

        if (refVideo.current) {
            refVideo.current.src = videoUrl
            /**
             * 如果改currentTime,好像會立即觸發timeupdate
             */
            refVideo.current.currentTime = startTimeSeconds
            // setPlayedSeconds(startTimeSeconds)

            if (autoPlayIfUrlChange) {
                refVideo.current.play()
            } else {
                refVideo.current.pause()
            }

        }
        /**
         * FIXME: 理論上應該要能選擇新片來的時候要不要autoplay
         * 這裡先擺爛,來就播放
         */
        // if (isStartPlay ?? isPlaying) {
        // 	refVideo.current?.play()
        // } else {
        // 	refVideo.current?.pause()
        // }
    }, [startTimeSeconds, videoUrl])




    const onNeedReport = useEffectEvent(() => {
        reportWatch(videoUrl, playedSeconds)
    })
    useEffect(() => {
        if (isPlaying) {
            let intervalId = setInterval(function () {
                onNeedReport()
            }, 1000)
            return () => {
                clearInterval(intervalId)
            }
        }
    }, [isPlaying,])
    useEffect(() => {
        onNeedReport()
    }, [videoUrl,])



    /**
     * cooldown based interval
     */
    // const refIsCooldown = useRef(false)
    // useEffect(() => {
    // 	console.log(1);
    // 	refIsCooldown.current = false
    // }, [videoUrl])
    // useEffect(() => {
    // 	// let confirmTimerId: NodeJS.Timeout | undefined = undefined
    // 	console.log('refIsCooldown.current', refIsCooldown.current);
    // 	if (!refIsCooldown.current) {
    // 		reportWatch(playedSeconds)
    // 		refIsCooldown.current = true
    // 		setTimeout(function () {
    // 			refIsCooldown.current = false
    // 		}, 1000);
    // 	}
    // 	// confirmTimerId = setTimeout(function () {
    // 	// 	/* FIXME: useEvent to get latest time */
    // 	// 	reportWatch(playedSeconds)
    // 	// }, 1000);
    // 	return () => {
    // 		// clearInterval(confirmTimerId)
    // 	}
    // }, [playedSeconds])
    // // const onUrlChange = useEffectEvent(() => {
    // // 	reportWatch(playedSeconds)
    // // })
    // // useEffect(() => {
    // // 	onUrlChange()
    // // }, [videoUrl])




    /**
     * interval
     */
    // const onTick = useEffectEvent(() => {
    // 	console.log(chalk.cyan('* onTick'));
    // 	/**
    // 	 * playedSeconds !== refVideo.current.currentTime
    // 	 * 的話,依賴一個很不穩定的東西
    // 	 * 理論上這兩者是一樣的,但是如果在播放,playedSeconds大概每秒更新2兩次,refVideo.current.currentTime無極更新
    // 	 * 所以兩者大概會不一樣...
    // 	 */
    // 	if (refVideo.current && playedSeconds !== refVideo.current.currentTime) {
    // 		reportWatch(refVideo.current.currentTime)
    // 	}
    // })
    // useEffect(() => {
    // 	console.log('onTick changedddddddddd');
    // 	let intervalId = setInterval(function () {
    // 		onTick()
    // 	}, 1000);
    // 	return () => {
    // 		clearInterval(intervalId)
    // 	}
    // }, [])




    /**
     * video如果load(),會讓play/pause重置為autoplay
     * video屬於outside,也就是說他變成paused這個屬於event,需要handler來變化相應的state
     * 我想要讓video在load之後保留原來的isPlaying
     * video load這個操作屬於event觸發,所以之後的play/pause也需要在同樣的位置給上
     */
    /**
     * 然後是onProgress的問題
     * 這個當然屬於event,由video本身播放觸發,或者由自己寫個定時器觸發
     * 定時器:
     * 每隔一秒,檢查playedSeconds和video.currentTime是否一樣,不一樣就觸發set,或者觸發新的handle
     * timeupdate:
     * 每次觸發...會不會太頻繁?不過不用檢查是否發生變化,肯定變了
     */
    /**
     * 有沒有可能可以完全declarative
     * isPlaying是true就讓video能放就放,除非不可抗力,沒加載好或者結束了
     * autoplay可以大概有效,但是還有例外
     * 如果ended,此時如果seek
     * 
     * 插曲: 	試了下ReactPlayer,好像是ended後就停住,但是我的isPlaying保持true,按兩下空格才能繼續
     * 			但是如果seek會強制根據isPlaying進行play()/pause()
     */
    useEffect(() => {
        const video = refVideo.current
        console.log('effect video:', video)
        function handleEvent(e: Event) {
            console.log('*', e.type)
            if (video) {
                if (e.type === 'durationchange') {
                    setIsPlaying(!video.paused)
                }
                // console.log('currentTime', video.currentTime);
                // console.log('duration', video.duration);
                // console.time('read proerties');
                for (let i = 0; i < 100; i++) {
                    // video.pause()
                    // video.play()
                    // !video.paused && video.pause()
                    // video.paused
                    // video.currentTime
                }
                /**
                 * video.currentTime和video.duration和video.paused都是0.06us級別的,實際上空的循環也要這麼多時間,也就是說基本0耗時
                 * 但是無變化的video.pause()要0.6us,無數倍時間
                 */

                // console.timeEnd('read proerties');
            }
        }
        if (video) {

            video.addEventListener('loadstart', handleEvent)
            video.addEventListener('durationchange', handleEvent)
            video.addEventListener('loadedmetadata', handleEvent)
            video.addEventListener('loadeddata', handleEvent)

            video.addEventListener('canplay', handleEvent)
            video.addEventListener('canplaythrough', handleEvent)

            // video.addEventListener('timeupdate', handleEvent)

            video.controls = true
            // video.autoplay = true
            video.muted = true
            setTimeout(function () {
                // body

            }, 1000)
        }

        return () => {
            video?.removeEventListener('loadstart', handleEvent)
            video?.removeEventListener('durationchange', handleEvent)
            video?.removeEventListener('loadedmetadata', handleEvent)
            video?.removeEventListener('loadeddata', handleEvent)

            video?.removeEventListener('canplay', handleEvent)
            video?.removeEventListener('canplaythrough', handleEvent)
        }
    }, [])

    useEffect(() => {
        if (refVideo.current) {
            refVideo.current.volume = volume
        }
    }, [volume])
    useEffect(() => {
        if (refVideo.current) {
            refVideo.current.muted = isMuted
        }
    }, [isMuted])
    useEffect(() => {
        if (refVideo.current) {
            if (isPlaying) {
                console.log('play')
                refVideo.current.play()
                refVideo.current.autoplay = true
            } else {
                console.log('pause')
                refVideo.current.pause()
                refVideo.current.autoplay = false
            }
        }
        return () => {

        }
    }, [isPlaying])


    function _loadVideo_deprecated(isStartPlay?: boolean) {
        const video = refVideo.current
        if (video) {
            /**
             * 這兩個順序有差誒?!
             * 先currentTime在src會導致,如果src沒變,currentTime會置零
             * doc上說了,空.load()會重置state
             */
            // video.src = "https://fnothing.hopto.org:55000/api/file/Rushia%20Ch.%20%E6%BD%A4%E7%BE%BD%E3%82%8B%E3%81%97%E3%81%82/Membership%20Streams/[20210504]%20%E3%80%90%E6%AD%8C%E6%9E%A0_song%E3%80%91%E6%B7%B1%E5%A4%9C%E3%81%AE%E6%AD%8C%E6%9E%A0%E3%83%BB%E3%83%BB%E3%83%BB%EF%BC%81%EF%BC%81%EF%BC%81%E3%80%90%E6%BD%A4%E7%BE%BD%E3%82%8B%E3%81%97%E3%81%82_%E3%83%9B%E3%83%AD%E3%83%A9%E3%82%A4%E3%83%96%E3%80%91(01JtCTIdggo).mp4"
            video.src = "https://fnothing.hopto.org:55000/api/file/%E8%8A%A6%E6%BE%A4%E3%82%B5%E3%82%AD/cover/[20201015]%E5%BF%83%E7%B5%B5%20(kokoroe)%20-%20%E3%83%AD%E3%83%BC%E3%83%89%E3%82%AA%E3%83%96%E3%83%A1%E3%82%B8%E3%83%A3%E3%83%BC%20_%20covered%20by%20%E8%8A%A6%E6%BE%A4%20%E3%82%B5%E3%82%AD-Nn-9VuX7JG0.webm"
            /**
             * load: 上新的src,重置時間到0,pausePlay為autoplay
             */
            video.load()
            video.currentTime = 100
            /**
             * 其實load
             */
            // if (isStartPlay) {
            // 	video.play()
            // } else {
            // 	video.pause()
            // }

            if (isStartPlay ?? isPlaying) {
                video.play()
            } else {
                video.pause()
            }
            // setIsPlaying(isPlaying)
        }
    }

    function _seekTo(offsetSeconds: number, seekFromSeconds?: number) {
        const video = refVideo.current
        if (video) {
            let newPlayedSeconds = (seekFromSeconds ?? video.currentTime) + offsetSeconds
            /**
             * WTF: 如果seek的時間超出了duration(還不知道是影片的duration還是字幕的duration),會讓JSO報錯:
             * subtitles-octopus-worker.js:1 Didn't received currentTime > 5 seconds. Assuming video was paused.
             * 我隨意猜:
             * 兩種情況 1.影片還沒完,字幕先完了√ 2.影片完了, 字幕還沒完
             * 觀察了一下ASS檔,最後一句字幕完了之後,影片還會播一會
             */
            if (newPlayedSeconds > duration) {
                newPlayedSeconds = Math.floor(duration)
            }

            log.log('*_seekTo() offsetSeconds=', offsetSeconds, 'newPlayedSeconds=', newPlayedSeconds)
            setPlayedSeconds(newPlayedSeconds)
            video.currentTime = newPlayedSeconds
        }
    }
    function _toggleMuted(isToMuted?: boolean) {
        setIsMuted((isMuted) => (isToMuted ?? !isMuted))
    }
    function _togglePlayPause(isToPlay?: boolean) {
        setIsPlaying((isPlaying) => (isToPlay ?? !isPlaying))
    }
    function _adjustVolumn(offset: number, newVolume?: number) {
        newVolume = (isMuted ? 0 : (newVolume ?? volume)) + offset
        if (newVolume > 1) {
            newVolume = 1
        } else if (newVolume < 0) {
            newVolume = 0
        }
        log.log('*_adjustVolumn', newVolume)
        localStorage.setItem('volume', newVolume.toString())
        localStorage.removeItem("isMute")
        setVolume(newVolume)
        setIsMuted(false)
    }
    return (
        <div>
            <button onClick={ () => { _loadVideo_deprecated() } }>Load Video</button>
            <button onClick={ () => { _loadVideo_deprecated(true) } }>Load Video & Play</button>
            <button onClick={ () => { _seekTo(0, 100) } }>Seek To 100</button>
            <button onClick={ () => { _seekTo(0, 1000) } }>Seek To 1000</button>

            <button onClick={ () => {
                _togglePlayPause()
                console.log(chalk.cyan('Click'))
            } }>{ isPlaying ? 'Playing' : 'Paused' }</button>
            <button onClick={ () => {
                _toggleMuted()
                console.log(chalk.cyan('Click'))
            } }>{ isMuted ? 'Muted' : 'Sound' }</button>
            <div className="w-96 relative">
                <video
                    className="relative" ref={ refVideo } width={ '100%' } height={ '100%' }
                    onTimeUpdate={ () => {
                        setPlayedSeconds(refVideo.current!.currentTime)
                        console.log('* onTimeUpdate:', refVideo.current!.currentTime)
                    } }
                    /**
                     * click -> *change* isPlaying -> effect pause video -> video emit event -> event-handler *change* isPlaying
                     * so two re-render 
                     * but it is ok, nothing wrong happeded
                     */
                    onPause={ () => {
                        console.log('* onPause')
                        setIsPlaying(false)
                    } }
                    onPlay={ () => {
                        console.log('* onPlay')
                        setIsPlaying(true)
                    } }
                    onEnded={ () => {
                        // seekTo(100)
                        // loadVideo(true)
                    } }
                    onVolumeChange={ () => {
                        console.log('* onVolumeChange')
                        setVolume(refVideo.current!.volume)
                        setIsMuted(refVideo.current!.muted)
                        // setIsMuted(false)
                    } }

                    onDurationChange={ () => { setDuration(refVideo.current!.duration) } }
                ></video>
            </div>
            <input
                type="range"
                className="w-80"
                value={ playedSeconds / duration * 100 || 0 }
                onChange={ (e) => {
                    _seekTo(0, parseFloat(e.currentTarget.value) / 100 * duration)
                    // setPlaySeconds(parseFloat(e.currentTarget.value) / 100 * duration)
                } }
            />
            <input
                type="range"
                className="w-80"
                value={ isMuted ? 0 : volume * 100 }
                onChange={ (e) => {
                    setVolume(parseFloat(e.currentTarget.value) / 100)
                    setIsMuted(false)
                    // setPlaySeconds(parseFloat(e.currentTarget.value) / 100 * duration)
                } }
            />
            <div>{ playedSeconds }/{ duration }</div>
            <Some></Some>
        </div>
    )
}

class Some extends Component<
    {},
    {
        a: number
    }
> {
    constructor(props: Some['props']) {
        super(props)
        this.state = { a: 1 }
    }
    render() {
        return (
            <div>a
                <Some2></Some2>
            </div>
        )
    }
}
function Some2() {
    const [count, setCount] = useState(0)

    // const ttt = useOnlineStatus()
    // function tt(argumefntsf) {
    // 	// bodyasfd
    // 	asf
    // 	asdfasg
    // 	gasease
    // 	asff
    // }
    return (
        <div>some2{ require('./some-cjs.js') }</div>
    )
}


