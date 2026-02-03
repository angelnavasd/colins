import { useBox } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useMemo } from 'react'
import { Mesh, Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'
import { useKeyboard } from '../hooks/useKeyboard'

interface CarProps {
    onPositionUpdate: (pos: Vector3, rot: number) => void
}

const Car = ({ onPositionUpdate }: CarProps) => {
    const { scene } = useGLTF('/models/free_porsche_911_carrera_4s.glb')
    const clonedScene = useMemo(() => scene.clone(), [scene])

    const [ref, api] = useBox<Mesh>(() => ({
        mass: 100,
        position: [0, 1, 0],
        args: [2, 1, 4],
        angularDamping: 0.9,
        linearDamping: 0.5,
        allowSleep: false,
        angularFactor: [0, 1, 0],
    }))

    const { forward, backward, left, right, brake, reset } = useKeyboard()
    const position = useRef([0, 1, 0])
    const velocity = useRef([0, 0, 0])
    const rotation = useRef([0, 0, 0])
    const speed = useRef(0)

    useEffect(() => api.position.subscribe((p) => (position.current = p)), [api])
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api])
    useEffect(() => api.rotation.subscribe((r) => (rotation.current = r)), [api])

    useFrame((state) => {
        if (position.current[1] < -30 || reset) {
            api.position.set(0, 2, 0)
            api.velocity.set(0, 0, 0)
            api.angularVelocity.set(0, 0, 0)
            api.rotation.set(0, 0, 0)
            speed.current = 0
            return
        }

        const yRotation = rotation.current[1]
        const forwardX = -Math.sin(yRotation)
        const forwardZ = -Math.cos(yRotation)

        const maxSpeed = 30
        const accel = 0.5
        const friction = 0.98

        if (forward) {
            speed.current = Math.min(speed.current + accel, maxSpeed)
        } else if (backward) {
            speed.current = Math.max(speed.current - accel, -maxSpeed * 0.3)
        } else {
            speed.current *= friction
        }

        if (brake) {
            speed.current *= 0.85
        }

        api.velocity.set(
            forwardX * speed.current,
            velocity.current[1],
            forwardZ * speed.current
        )

        if (left) api.angularVelocity.set(0, 2.5, 0)
        if (right) api.angularVelocity.set(0, -2.5, 0)

        // GTA-style chase camera
        const carPos = new Vector3(...position.current)
        const cameraDistance = 8
        const cameraHeight = 3

        // Camera behind the car based on its rotation
        const cameraX = carPos.x + Math.sin(yRotation) * cameraDistance
        const cameraZ = carPos.z + Math.cos(yRotation) * cameraDistance

        const targetCameraPos = new Vector3(cameraX, carPos.y + cameraHeight, cameraZ)
        state.camera.position.lerp(targetCameraPos, 0.1)
        state.camera.lookAt(carPos.x, carPos.y + 1, carPos.z)

        onPositionUpdate(carPos, yRotation)
    })

    return (
        <group ref={ref}>
            <primitive
                object={clonedScene}
                scale={[0.8, 0.8, 0.8]}
                position={[0, 0.3, 0]}
                rotation={[0, Math.PI, 0]}
            />
        </group>
    )
}

useGLTF.preload('/models/free_porsche_911_carrera_4s.glb')

export default Car
