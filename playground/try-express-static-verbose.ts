import express from 'express'
import path from 'node:path'
import mime from 'mime-types'
const app = express()
// express.static.mime.d

// Verbose logger
app.use((req, res, next) => {
    console.log('\n================ REQUEST ================')
    console.log(`${req.method} ${req.originalUrl}`)
    console.log('Headers:')
    console.log(req.headers)

    const start = Date.now()

    res.on('finish', () => {
        console.log('================ RESPONSE ================')
        console.log(`Status: ${res.statusCode}`)
        console.log(`Time: ${Date.now() - start} ms`)

        console.log('Headers:')
        console.log(res.getHeaders())

        console.log('=========================================\n')
    })

    next()
})

console.log(path.join(import.meta.dirname, '..', 'public'))
console.log(mime.lookup('test.mp4'))
// Serve static files
app.use(express.static(path.join(import.meta.dirname, '..', 'public'), {
    etag: false,
    setHeaders: (res, path) => {
        res.set('Cache-Control', 'no-store')
    }
}))

app.listen(3001, () => {
    console.log('Listening on http://0.0.0.0:3001')
}) 