import { clsx } from "clsx"
import { useEffect, useRef, useState } from "react"
import vert from './try39-webgl.vert?raw'
import frag from './try39-webgl.frag?raw'
import { mat4 } from 'gl-matrix'
export default function App() {
    const [count, setCount] = useState(0)
    const refCanvas = useRef<HTMLCanvasElement>(null!)
    const refGl = useRef<WebGL2RenderingContext>(null)
    useEffect(() => {
        const canvas = refCanvas.current
        const gl = canvas.getContext("webgl2")
        if (gl === null) {
            alert('webgl2 not supported')
            throw "?"
        }
        refGl.current = gl


        const { programInfo, buffers } = (() => {
            const shaderProgram = initShaderProgram(gl, vert, frag)
            const programInfo: ProgramInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
                },
                uniformLocations: {
                    modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                    projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                },
            }
            const buffers = initBuffers(gl)
            return { programInfo, buffers }
        })()


        const resizeObserver = new ResizeObserver(([entry]) => {
            if (entry.target instanceof HTMLCanvasElement) {
                entry.target.width = entry.devicePixelContentBoxSize[0]?.inlineSize ?? 0
                entry.target.height = entry.devicePixelContentBoxSize[0]?.blockSize ?? 0
                gl.viewport(0, 0, entry.target.width, entry.target.height)
            }
            drawScene(gl, programInfo, buffers)
        })
        resizeObserver.observe(canvas, { box: "device-pixel-content-box" })

        return () => {
            resizeObserver.disconnect()
        }
    }, [])


    return (
        <div>
            <canvas ref={ refCanvas } className={ clsx(
                'm-4 w-3/4 h-[80vh] outline outline-dashed outline-amber-300/50',
            ) }>

            </canvas>
        </div>
    )
}


interface ProgramInfo {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: GLint
    },
    uniformLocations: {
        modelViewMatrix: WebGLUniformLocation | null,
        projectionMatrix: WebGLUniformLocation | null,
    },


}
interface Buffers {
    position: WebGLBuffer,
}



function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
    function loadShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
        const shader = gl.createShader(type)
        if (!shader) {
            alert("failed ?")
            throw ""
        }
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const msg = `compile shader failed: ${gl.getShaderInfoLog(shader)}`
            // alert(msg)
            gl.deleteShader(shader)
            throw msg
        }
        return shader
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`linkProgram failed: ${gl.getProgramInfoLog(shaderProgram)}`)
    }
    return shaderProgram
}


function initBuffers(gl: WebGL2RenderingContext): Buffers {
    function initPositionBuffer(gl: WebGL2RenderingContext) {
        const positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        const positions = [1., 1., -1., 1., 1., -1., -1., -1.]
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
        return positionBuffer
    }
    const positionBuffer = initPositionBuffer(gl)
    return {
        position: positionBuffer,
    }
}

function drawScene(gl: WebGL2RenderingContext, programInfo: ProgramInfo, buffers: Buffers) {
    gl.clearColor(.0, .0, .0, .0)
    gl.clearDepth(1.)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    function setPositionAttribute(gl: WebGL2RenderingContext, programInfo: ProgramInfo, buffers: Buffers) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    }

    const fieldOfView = (45 * Math.PI) / 180
    const canvas = gl.canvas
    if (canvas instanceof HTMLCanvasElement) {
        const aspect = canvas.width / canvas.height
        const zNear = .1
        const zFar = 100.
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
        const modelViewMatrix = mat4.create()

        mat4.translate(modelViewMatrix, modelViewMatrix, [-.0, .0, -6.])

        setPositionAttribute(gl, programInfo, buffers)

        gl.useProgram(programInfo.program)
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

}
