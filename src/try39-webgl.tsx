import { clsx } from "clsx"
import { useEffect, useRef, useState } from "react"
import vert from './try39-webgl.vert?raw'
import frag from './try39-webgl.frag?raw'
import { mat4 } from 'gl-matrix'
export default function App() {
    // const [count, setCount] = useState(0)
    const refCanvas = useRef<HTMLCanvasElement>(null!)
    // const refGl = useRef<WebGL2RenderingContext>(null)
    useEffect(() => {
        const canvas = refCanvas.current
        const gl = canvas.getContext("webgl2")
        if (gl === null) {
            alert('webgl2 not supported')
            throw "?"
        }
        // refGl.current = gl


        const { programInfo, vao } = (() => {
            const shaderProgram = initShaderProgram(gl, vert, frag)
            /**
             * the locations of attribute is specific to vert and frag, so they should live here, not `initShaderProgram`
             */
            const programInfo: ProgramInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                    vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
                },
                uniformLocations: {
                    modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
                    projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                },
            }
            const vao = initBuffers(gl, programInfo)
            return { programInfo, vao }
        })()


        const resizeObserver = new ResizeObserver(([entry]) => {
            if (entry.target instanceof HTMLCanvasElement) {
                entry.target.width = entry.devicePixelContentBoxSize[0]?.inlineSize ?? 0
                entry.target.height = entry.devicePixelContentBoxSize[0]?.blockSize ?? 0
                gl.viewport(0, 0, entry.target.width, entry.target.height)
            }
            drawScene(gl, programInfo, vao)
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

/**
 * Program is vertex shader + fragment shader
 * they have some params (attributes, uniforms) we can pass
 * to access them in the cpu side, we need getAttribLocation() and getUniformLocation(), and store here together with program
 * 
 * to add an attribute in shader
 * 1. add in shader
 * 2. add the the location member here, and typescript will warn me to add the getXxxLocation()
 * 3. use it when init buffers
 */
interface ProgramInfo {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: GLint
        vertexColor: GLint
    },
    uniformLocations: {
        modelViewMatrix: WebGLUniformLocation | null
        projectionMatrix: WebGLUniformLocation | null
    },


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
        throw '?'
    }
    return shaderProgram
}


function initBuffers(gl: WebGL2RenderingContext, programInfo: ProgramInfo): WebGLVertexArrayObject {
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    /**
     * OHHH! VAO works!
     * it combines data (bindBuffer()) and data layout (vertexAttribPointer()) together! elegant!
     */
    if (true) {
        {
            const positionBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            const positions = [
                1., 1.,
                -1., 1.,
                1., -1.,
                -1., -1.,
            ]
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
        }
        {
            const colorBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
            const colors = [
                1., 1., 1., 1., // white
                1., 0., 0., 1., // red
                0., 1., 0., 1., // green
                0., 0., 1., 1., // blue
            ]
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
        }
    } else {
        {
            const buffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
            /* x,y, r,g,b,a, */
            const attributes = [
                1., 1., /* Position */ 1., 1., 1., 1., /* white */
                -1., 1., /* Position */ 1., 0., 0., 1., /* red */
                1., -1., /* Position */ 0., 1., 0., 1., /* green */
                -1., -1., /* Position */ 0., 0., 1., 1., /* blue */
            ]
            const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributes), gl.STATIC_DRAW)
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 6 * FLOAT_SIZE, 0)
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 6 * FLOAT_SIZE, 2 * FLOAT_SIZE)
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
        }
    }


    gl.bindVertexArray(null)

    return vao
}

function drawScene(gl: WebGL2RenderingContext, programInfo: ProgramInfo, vao: WebGLVertexArrayObject) {
    gl.clearColor(.0, .0, .0, .0)
    gl.clearDepth(1.)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


    const fieldOfView = (45 * Math.PI) / 180
    const canvas = gl.canvas
    if (canvas instanceof HTMLCanvasElement) {
        const aspect = canvas.width / canvas.height
        const zNear = .1
        const zFar = 100.
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
        const modelViewMatrix = mat4.create()

        mat4.translate(modelViewMatrix, modelViewMatrix, [-.0, .0, -6.0])

        // setPositionAttribute(gl, programInfo, buffers)
        // setColorAttribute(gl, programInfo, buffers)
        gl.bindVertexArray(vao)

        gl.useProgram(programInfo.program)
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

}
