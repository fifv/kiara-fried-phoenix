import { useEffect, useState } from "react"
export default function App() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        async function func() {
            const support = await VideoDecoder.isConfigSupported({
                codec: 'hev1.1.6.L93.B0'
            })

            console.log(support.supported)
        }
        func()

        const decoder = new VideoDecoder({
            output(frame) {
                console.log(frame)
            },
            error(e) {
                console.log(e)
            },
        })
        decoder.configure({ codec: 'hev1.1.6.L93.B0' })
    }, [])
    return (
        <div></div>
    )
}
