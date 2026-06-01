import { useEffect, useRef, useState } from "react"
import { Input, ReadableStreamSource, ALL_FORMATS, UrlSource, MATROSKA, Output, MP4, Mp4OutputFormat, Target, StreamTarget, BufferTarget, Conversion } from 'mediabunny'
export default function App() {
    const [count, setCount] = useState(0)

    const refVideo = useRef<HTMLVideoElement>(null)
    useEffect(() => {
        (async () => {
            // const bodyStream = await fetch('./test.mkv').then((x) => x.body)
            // console.log(bodyStream)
            const input = new Input({
                formats: [MATROSKA],
                // source: new ReadableStreamSource(bodyStream),
                source: new UrlSource('./test.mkv'),
            })
            console.log(input)
            const duration = await input.computeDuration()
            console.log('duration:', duration)
            const allTracks = await input.getTracks()
            console.log('allTracks:', allTracks)


            const output = new Output({
                format: new Mp4OutputFormat(),
                target: new BufferTarget(),
            })
            const conversion = await Conversion.init({
                input: input,
                output: output,
            })
            console.log('conversion.execute');
            console.time('conversion.execute');
            await conversion.execute()
            console.timeEnd('conversion.execute');
            if (output.target.buffer) {
                console.log(output.target.buffer)
                const blob = new Blob([output.target.buffer], {
                    type: await output.getMimeType(),
                })
                const video = refVideo.current
                if (video) {
                    video.src = URL.createObjectURL(blob)
                    // await video.play()
                }
            }
            // output.start()
            // output.addVideoTrack(await input.getPrimaryVideoTrack())
            // console.log(output)
            // if (output.target.buffer) {
            //     const blob = new Blob([output.target.buffer])
            //     console.log(blob)
            // }
        })()
    }, [])
    return (
        <div>
            <video ref={ refVideo } controls muted autoPlay className="h-72 w-128" />
        </div>
    )
}
