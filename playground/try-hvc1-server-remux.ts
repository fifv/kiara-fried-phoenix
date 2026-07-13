import { spawn } from 'node:child_process'
import { mkdir, rename, stat, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import express from 'express'

const app = express()
const host = process.env.HOST ?? '0.0.0.0'
const port = Number(process.env.PORT ?? 3001)

const inputPath = path.join(
    import.meta.dirname,
    '..',
    'public',
    'media',
    'test-hevc.mkv',
)
const cacheDirectory = path.join(tmpdir(), 'kiara-fried-phenix')
const outputPath = path.join(cacheDirectory, 'test-hevc-hvc1.mp4')

let pendingRemux: Promise<void> | undefined

async function outputIsCurrent() {
    try {
        const [input, output] = await Promise.all([
            stat(inputPath),
            stat(outputPath),
        ])

        return output.size > 0 && output.mtimeMs >= input.mtimeMs
    } catch {
        return false
    }
}

async function remux() {
    await mkdir(cacheDirectory, { recursive: true })

    const temporaryPath = path.join(
        cacheDirectory,
        `test-hevc-hvc1-${process.pid}-${Date.now()}.mp4`,
    )

    try {
        await new Promise<void>((resolve, reject) => {
            const ffmpeg = spawn(
                'ffmpeg',
                [
                    '-y',
                    '-i',
                    inputPath,
                    '-c',
                    'copy',
                    '-tag:v',
                    'hvc1',
                    temporaryPath,
                ],
                { stdio: ['ignore', 'inherit', 'inherit'] },
            )

            ffmpeg.once('error', reject)
            ffmpeg.once('close', (code, signal) => {
                if (code === 0) {
                    resolve()
                    return
                }

                reject(
                    new Error(
                        `ffmpeg failed with ${signal ? `signal ${signal}` : `exit code ${code}`}`,
                    ),
                )
            })
        })

        await unlink(outputPath).catch(() => undefined)
        await rename(temporaryPath, outputPath)
    } catch (error) {
        await unlink(temporaryPath).catch(() => undefined)
        throw error
    }
}

async function ensureRemuxed() {
    if (await outputIsCurrent()) {
        return
    }

    pendingRemux ??= remux().finally(() => {
        pendingRemux = undefined
    })

    await pendingRemux
}

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

app.get('/t.mp4', async (_req, res, next) => {
    try {
        await ensureRemuxed()
        res.sendFile(outputPath, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error) {
        next(error)
    }
})

app.listen(port, host, () => {
    console.log(`Listening on http://${host}:${port}/t.mp4`)
    console.log(`Source: ${inputPath}`)
})
