import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeElements, useThree, extend, useLoader, } from '@react-three/fiber'
import { Center, FlyControls, OrbitControls, PointerLockControls, Sparkles, Text3D, shaderMaterial, useGLTF, useTexture } from '@react-three/drei'
import clsx from 'clsx'
// import glsl from 'glslify'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { PortalModel } from './try21.portal'

function Box(props: ThreeElements['mesh']) {
    // This reference will give us direct access to the mesh
    const meshRef = useRef<THREE.Mesh>(null!)
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta
    })
    // Return view, these are regular three.js elements expressed in JSX
    return (
        <mesh
            { ...props }
            ref={ meshRef }
            scale={ active ? 1.5 : 1 }
            onClick={ (event) => setActive(!active) }
            onPointerOver={ (event) => setHover(true) }
            onPointerOut={ (event) => setHover(false) }>
            <boxGeometry args={ [1, 1, 1] } />
            <meshStandardMaterial color={ hovered ? 'hotpink' : 'orange' } />
        </mesh>
    )
}
function LoadingWrapper(props: ThreeElements['mesh']) {
    return (
        <Canvas>
            <Loading { ...props } />
        </Canvas>
    )

}
function Loading(props: ThreeElements['mesh']) {
    // This reference will give us direct access to the mesh
    const meshRef = useRef<THREE.Mesh>(null!)
    // Set up state for the hovered and active state
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        // meshRef.current.rotation.x += delta * 3
        // meshRef.current.rotation.y += delta * 3
        meshRef.current.rotation.z += delta * 3
    })    // Return view, these are regular three.js elements expressed in JSX
    return (
        <mesh
            { ...props }
            ref={ meshRef }
        >
            {/* <sphereGeometry args={ [0.5, 16, 8] } />
            <meshNormalMaterial wireframe /> */}
            <torusGeometry args={ [0.5, 0.1, , , Math.PI * 1.5] } />
            {/* <meshNormalMaterial wireframe /> */ }
            <meshNormalMaterial />
        </mesh>
    )
}
function TorusKnot() {
    return (
        <mesh position={ [3, 1, 3] }>
            <torusKnotGeometry args={ [, , 150, 30] }></torusKnotGeometry>
            <meshStandardMaterial wireframe color={ 0xffff00 }></meshStandardMaterial>
        </mesh>
    )
}
function CameraHelper() {
    const { camera } = useThree()
    // return <cameraHelper camera={ camera } />
}
const scale = Float32Array.from({ length: 50 }, () => 0.5 + Math.random() * 4)
function WASD() {
    const [keydownStatus, setKeydownStatus] = useState(new Set<string>())
    useEffect(() => {
        function handleKeyEvent(e: KeyboardEvent) {
            if (e.type === 'keydown') {
                setKeydownStatus((keydownStatus) => {
                    keydownStatus.add(e.key.toLowerCase())
                    return keydownStatus
                })
            } else if (e.type === 'keyup') {
                setKeydownStatus((keydownStatus) => {
                    keydownStatus.delete(e.key.toLowerCase())
                    return keydownStatus
                })
            }
        }
        document.addEventListener('keydown', handleKeyEvent)
        document.addEventListener('keyup', handleKeyEvent)
        return () => {
            document.removeEventListener('keydown', handleKeyEvent)
            document.removeEventListener('keyup', handleKeyEvent)
        }
    }, [])
    const { camera } = useThree()
    useFrame((state, delta) => {
        if (keydownStatus.has('a')) {
            camera.position.x -= 0.04
        }
        if (keydownStatus.has('d')) {
            camera.position.x += 0.04
            // camera.rotation.x += 0.1
        }
        if (keydownStatus.has('w')) {
            camera.position.z -= 0.04
        }
        if (keydownStatus.has('s')) {
            camera.position.z += 0.04
        }
        if (keydownStatus.has('shift')) {
            camera.position.y -= 0.04
        }
        if (keydownStatus.has(' ')) {
            camera.position.y += 0.04
        }
    })
    return undefined
}



export default function App() {
    const [count, setCount] = useState(0)
    // const { camera } = useThree()
    return (
        <div className={ clsx(
            'h-screen w-screen',
        ) }>
            {/* <TTT /> */ }
            <MyApp />
            {/* <Loading /> */ }
            {/* <LoadingWrapper /> */ }

        </div>
    )
}

function MyApp() {
    return (<div className={ clsx(
        'h-screen w-screen',
    ) }>
        <Suspense fallback={ <LoadingWrapper /> }>
            <Canvas
                gl={ {
                    // useLegacyLights: true,
                } }
                camera={ {
                    position: [0, 2, 5],
                    // rotation:[0,1,1]
                } }
            >

                <WASD />
                {/* <Loading /> */ }
                <ambientLight intensity={ 0.5 * Math.PI } />
                {/* <spotLight intensity={100000} position={ [10, 10, 10] } angle={ 0.15 } penumbra={ 1 } color={ 'blue' } /> */ }
                <pointLight position={ [-10, 10, 10] } intensity={ 1000 } />
                <Box position={ [-1.2, 0, 0] } />
                <Box position={ [1.2, 0, 0] } />
                {/* <directionalLight color="red" position={[0, 0, 5]} /> */ }
                {/* <PointerLockControls></PointerLockControls> */ }
                <OrbitControls />
                {/* <FlyControls movementSpeed={4}> </FlyControls> */ }
                <gridHelper />
                <axesHelper />
                <TorusKnot></TorusKnot>
                <Sparkles count={ scale.length }
                    size={ scale }
                    position={ [0, 0.9, 0] }
                    scale={ [4, 1.5, 4] } speed={ 0.3 }
                />
                <Suspense fallback={ <LoadingWrapper rotation={ [0, Math.PI * -0.2, 0] } /> }>
                    <Center disableY>
                        <Text3D font={ 'fonts/FZZhunYuan-M02_Regular.json' } position={ [0, 1, 0] }
                            letterSpacing={ 0.3 }
                            curveSegments={ 100 } /* Smooth */
                            bevelEnabled
                            bevelSize={ 0.1 }
                            // bevelThickness={ 0.2 }
                            // bevelOffset={0.01}
                            bevelSegments={ 30 } /* Smooth */
                        >
                            {/* B20030819 */ }
                            PEKO
                            <meshNormalMaterial />
                        </Text3D>
                    </Center>
                </Suspense>

                <Suspense fallback={ <LoadingWrapper /> }>
                    <PortalModel />
                </Suspense>
                {/* <CameraHelper></CameraHelper> */ }
            </Canvas>
        </Suspense>
    </div>)
}


function TTT() {
    const [count, setCount] = useState(0)
    return (
        <Canvas>
            <ambientLight intensity={ Math.PI / 2 } />
            <spotLight position={ [10, 10, 10] } angle={ 0.15 } penumbra={ 1 } decay={ 0 } intensity={ Math.PI } />
            <pointLight position={ [-10, -10, -10] } decay={ 0 } intensity={ Math.PI } />
            <Box position={ [-1.2, 0, 0] } />
            <Box position={ [1.2, 0, 0] } />
        </Canvas>
    )
}
