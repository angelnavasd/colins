import { useFrame, useThree } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import { useRef, useMemo, useEffect } from 'react'
import { Group, Vector3, Raycaster, MathUtils } from 'three'
import { LamborghiniModel } from './LamborghiniModel'

// Cube state type
interface CubeState {
    position: Vector3
    velocity: Vector3
    fallen: boolean
}

interface CarControllerProps {
    worldRef: React.RefObject<Group | null>
    cubeStates: React.MutableRefObject<CubeState[]>
    onRespawn: () => void
}

// Keyboard state (global)
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
}

if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.forward = true
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.backward = true
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true
        if (e.code === 'Space') keys.brake = true
    })
    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.forward = false
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.backward = false
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false
        if (e.code === 'Space') keys.brake = false
    })
}

const CarController = ({ worldRef, cubeStates, onRespawn }: CarControllerProps) => {
    const carGroupRef = useRef<Group>(null)
    const carModelRef = useRef<Group>(null)

    // Individual wheel refs for precise control
    const flWheel = useRef<Group>(null)
    const frWheel = useRef<Group>(null)
    const rlWheel = useRef<Group>(null)
    const rrWheel = useRef<Group>(null)
    const { camera } = useThree()

    // Physics state
    const velocity = useRef(0)
    const steeringAngle = useRef(0)
    const isFalling = useRef(false)
    const hasLanded = useRef(false)
    const verticalVelocity = useRef(0)

    // Constants
    const maxSpeed = 1.2
    const acceleration = 0.02 // More responsive  
    const deceleration = 0.012 // Slower deceleration for realistic coasting
    const friction = 0.985 // Less friction for smoother feel
    const turnSpeed = 0.05 // Smooth but responsive steering
    const gravity = 0.005

    // Raycaster for ground detection
    const raycaster = useMemo(() => new Raycaster(), [])
    const downVector = useMemo(() => new Vector3(0, -1, 0), [])

    // Camera state - Dynamic GTA-style camera
    const cameraOrbit = useRef({ x: 0, y: 0.35 }) // Slightly higher initial pitch Haus
    const isDragging = useRef(false)
    const cameraDist = useRef(5) // Dynamic distance

    // Wheel animation state
    const wheelRotations = useRef({ fl: 0, fr: 0, rl: 0, rr: 0 })

    // Mouse control logic
    useEffect(() => {
        const handleMouseDown = () => { isDragging.current = true }
        const handleMouseUp = () => { isDragging.current = false }
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging.current) {
                cameraOrbit.current.x -= e.movementX * 0.005
                cameraOrbit.current.y = MathUtils.clamp(cameraOrbit.current.y - e.movementY * 0.005, 0.05, 0.5)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('mousemove', handleMouseMove)
        return () => {
            document.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useFrame((_state, delta) => {
        if (!worldRef.current || !carGroupRef.current || !carModelRef.current) return

        // Infinite highway logic Haus

        // --- 1. MOVEMENT PHYSICS ---
        if (!isFalling.current) {
            // Acceleration with better feel
            if (keys.forward) {
                velocity.current += acceleration
            } else if (keys.backward) {
                velocity.current -= deceleration
            } else {
                // Coast naturally
                velocity.current *= friction
            }

            if (keys.brake) velocity.current *= 0.88 // Stronger braking

            // Clamp speed
            velocity.current = MathUtils.clamp(velocity.current, -maxSpeed * 0.5, maxSpeed)

            // Steering - Constrained to prevent 180 turns on the highway Haus
            if (Math.abs(velocity.current) > 0.01) {
                const steerFactor = Math.abs(velocity.current) / maxSpeed
                const dir = velocity.current > 0 ? 1 : -1

                // Allow steering but try to keep it within -PI/4 and PI/4 Haus
                // Inverted logic for 180 rotation
                if (keys.left) steeringAngle.current += turnSpeed * steerFactor * dir
                if (keys.right) steeringAngle.current -= turnSpeed * steerFactor * dir

                steeringAngle.current = MathUtils.clamp(steeringAngle.current, -Math.PI / 3, Math.PI / 3)
            }
        }

        // --- 2. RELATIVE WORLD MOVEMENT ---
        // Move the world, not the car.
        // We calculate delta movement based on Car Heading (steeringAngle)
        // Move world in opposite direction to simulate car movement
        // We want to drive TOWARDS the sun (-Z).
        // So "Forward" velocity > 0 should move us -Z.
        // This means the World must move +Z (objects come closer from -Z).

        const moveX = Math.sin(steeringAngle.current) * velocity.current
        const moveZ = Math.cos(steeringAngle.current) * velocity.current

        // X movement: Steer Left -> Car moves -X. World moves +X.
        // If facing -Z. Left turn points to -X.
        // So World.x += moveX is correct?
        // Let's test.

        worldRef.current.position.x += moveX
        worldRef.current.position.z += moveZ // Moving world +Z brings objects from -Z closer.

        // We do NOT rotate the world. The world stays axis-aligned. 
        // This solves the "sliding" issue.
        worldRef.current.rotation.set(0, 0, 0)

        // Infinite Road Looping
        // Infinite Road Looping
        // DISABLED: Handled by InfiniteRoad.tsx modular recycling now.
        // Keeping worldRef monotonic allows InfiniteRoad to adjust local offsets correctly.
        // if (worldRef.current.position.z > loopSize) worldRef.current.position.z -= loopSize
        // if (worldRef.current.position.z < -loopSize) worldRef.current.position.z += loopSize

        // Check road boundaries (X axis)
        // DISABLED: Raycaster handles this naturally. If we drive off mesh, we fall.
        // const carXInWorld = -worldRef.current.position.x
        // if (Math.abs(carXInWorld) > 140) isFalling.current = true


        // --- 3. GROUND ALIGNMENT & FALLING ---
        // let groundY = -100

        if (!isFalling.current) {
            // Raycast down from car position relative to world
            raycaster.set(new Vector3(0, 20, 0), downVector)
            const intersects = raycaster.intersectObjects(worldRef.current.children, true)
            const groundHit = intersects.find(hit => hit.object.name === 'Terrain')

            if (groundHit) {
                // groundY = groundHit.point.y // Unused now Haus
                hasLanded.current = true // Car has officially touched the ground at least once

                // IMPORTANT: Separate Y rotation (heading/steering) from terrain alignment (pitch/roll)
                // This makes the turn MUCH more visible and responsive

                // 1. Apply Y rotation DIRECTLY from steering angle (instant response)
                carGroupRef.current.rotation.y = steeringAngle.current

                // 2. Apply terrain alignment for pitch and roll ONLY (not yaw/heading)
                const n = groundHit.face!.normal.clone().transformDirection(groundHit.object.matrixWorld)

                // Calculate pitch (X) and roll (Z) from terrain normal
                const currentY = carGroupRef.current.rotation.y // Preserve our steering rotation

                // Terrain tilt angles
                const targetPitch = Math.asin(n.x)
                const targetRoll = -Math.asin(n.z)

                // Smoothly apply pitch/roll while keeping instant Y rotation
                const currentEuler = carGroupRef.current.rotation
                carGroupRef.current.rotation.set(
                    MathUtils.lerp(currentEuler.x, targetPitch, delta * 5),
                    currentY, // Keep direct steering rotation
                    MathUtils.lerp(currentEuler.z, targetRoll, delta * 5)
                )

            } else if (hasLanded.current) {
                // Only fall if we have already landed once before.
                // This prevents falling through the floor on initial load before terrain is ready.
                isFalling.current = true
            }
        }

        if (isFalling.current) {
            verticalVelocity.current -= gravity
            carGroupRef.current.position.y += verticalVelocity.current
            // Reset
            // Reset
            if (carGroupRef.current.position.y < -20) {
                onRespawn()
                // HARD RESET
                // RESET X (Re-center road) but KEEP Z (Keep segments visible)
                worldRef.current.position.x = 0
                // worldRef.current.position.z // Keep as is to avoid segment popping

                velocity.current = 0
                steeringAngle.current = 0
                isFalling.current = false
                verticalVelocity.current = 0
                hasLanded.current = false

                carGroupRef.current.position.set(0, 0.5, 0) // Start slightly above ground
                carGroupRef.current.rotation.set(0, 0, 0)

                // Add a small upward velocity boost to prevent immediate ground clip
                // verticalVelocity.current = 0
            }
        } else {
            // Stick to ground - locked to 0 for stability now Haus
            carGroupRef.current.position.y = 0 // Forced Haus
        }


        // --- 4. VISUAL PHYSICS (The "Feel") ---
        // Body roll DISABLED - car stays solid and grounded
        const targetRoll = 0 // No roll - car stays flat when turning
        carModelRef.current.rotation.z = MathUtils.lerp(carModelRef.current.rotation.z, targetRoll, delta * 8)

        // Pitch - DISABLED to prevent sinking front
        const targetPitch = 0 // Keep car level
        carModelRef.current.rotation.x = MathUtils.lerp(carModelRef.current.rotation.x, targetPitch, delta * 4)

        // Wheel animations - Individual control for Lamborghini
        const rotationSpeed = velocity.current * 2.5 // Increased for more visible spin
        wheelRotations.current.fl += rotationSpeed
        wheelRotations.current.fr += rotationSpeed
        wheelRotations.current.rl += rotationSpeed
        wheelRotations.current.rr += rotationSpeed

        const targetSteerAngle = (keys.left ? 1.0 : (keys.right ? -1.0 : 0))
        const smoothSteer = MathUtils.lerp(flWheel.current?.rotation.y || 0, targetSteerAngle, delta * 12)

        // Front wheels: Roll (X) + Steer (Y)
        if (flWheel.current) {
            flWheel.current.rotation.set(wheelRotations.current.fl, smoothSteer, 0, 'YXZ')
        }
        if (frWheel.current) {
            frWheel.current.rotation.set(wheelRotations.current.fr, smoothSteer, 0, 'YXZ')
        }

        // Rear wheels: Just roll (X)
        if (rlWheel.current) {
            rlWheel.current.rotation.set(wheelRotations.current.rl, 0, 0, 'YXZ')
        }
        if (rrWheel.current) {
            rrWheel.current.rotation.set(wheelRotations.current.rr, 0, 0, 'YXZ')
        }


        // --- 5. CUBE COLLISIONS ---
        // Simple sphere overlap in global space helps
        // World was moved, so Cube Global = Cube Local + World Pos

        cubeStates.current.forEach(cube => {
            if (cube.fallen) return

            const cubeGlobal = cube.position.clone().add(worldRef.current!.position)
            const dist = new Vector3(cubeGlobal.x, 0, cubeGlobal.z).length() // Car is at 0,0,0

            if (dist < 2.5) {
                // Impulse: Direction from Car (0,0,0) to Cube
                // Since Car is moving forward, hitting a cube essentially imparts forward momentum + outward

                // Simplest arcade feel: Push away from car center
                const pushDir = cubeGlobal.normalize()
                pushDir.y = 0.5

                // Apply to local velocity
                // Since world is not rotated, we can add directly (mostly)
                cube.velocity.add(pushDir.multiplyScalar(Math.abs(velocity.current) * 1.5 + 0.2))
            }
        })


        // --- 6. CAMERA (GTA-style dynamic) ---
        if (!isDragging.current) {
            cameraOrbit.current.x = MathUtils.lerp(cameraOrbit.current.x, 0, delta * 2)
        }

        // GTA-style effect: Camera goes BACK when accelerating (car looks smaller/faster)
        // Camera comes CLOSE when reversing (car looks bigger/slower)
        const speedFactor = velocity.current / maxSpeed
        const targetDist = 5 + (speedFactor * 2.5) // Base 5, +2.5 when full speed forward, -1.25 when reversing
        cameraDist.current = MathUtils.lerp(cameraDist.current, targetDist, delta * 3)

        // Camera stays behind car, lower angle for more "behind" feel 
        // Car heading is `steeringAngle`.
        // Camera Angle = Car Heading + Orbit.
        // We want Camera at +Z (Behind) when Angle is 0.
        // cos(0) = 1 -> +Z. Correct.
        const totalAngle = steeringAngle.current + cameraOrbit.current.x

        const camX = Math.sin(totalAngle) * cameraDist.current
        const camZ = Math.cos(totalAngle) * cameraDist.current
        const camY = 2.5 + cameraOrbit.current.y * 2 // Lower base height (was 1.2 + ...) for that low arcade feel

        // Target camera position
        const targetCamPos = new Vector3(camX, camY + carGroupRef.current.position.y, camZ)

        camera.position.lerp(targetCamPos, delta * 6)
        // Look slightly UP (horizon) instead of down at the car
        // Car Y + 1.5 makes it look forward/up
        camera.lookAt(0, carGroupRef.current.position.y + 2.0, 0)
    })

    // ... inside the component, inside the car group ...

    return (
        <group ref={carGroupRef} position={[0, 1, 0]}>
            {/* Rotate model 180 to face Sun (-Z) */}
            <group ref={carModelRef} rotation={[0, Math.PI, 0]}>
                <LamborghiniModel
                    wheelRefs={{ fl: flWheel, fr: frWheel, rl: rlWheel, rr: rrWheel }}
                    scale={[0.01, 0.01, 0.01]}
                    rotation={[0, 0, 0]}
                />

                {/* Volumetric Headlights - OPTIMIZED */}
                <SpotLight
                    position={[0.8, 0.8, -1.8]}
                    angle={0.4}
                    penumbra={1}
                    distance={40}
                    color="#fff"
                    intensity={5}
                    castShadow
                    volumetric={true as any}
                    target-position={[0.8, -2, -30]} // Aim at ground
                    opacity={0.3}
                />
                <SpotLight
                    position={[-0.8, 0.8, -1.8]}
                    angle={0.4}
                    penumbra={1}
                    distance={40}
                    color="#fff"
                    intensity={5}
                    castShadow
                    volumetric={true as any}
                    target-position={[-0.8, -2, -30]} // Aim at ground
                    opacity={0.3}
                />

                {/* Undercarriage Neon Glow */}
                <pointLight position={[0, 0.5, 0]} intensity={2} distance={10} color="#00ffff" decay={2} />

                {/* Reverse/brake lights - red lights at the back */}
                {(keys.backward || keys.brake) && (
                    <>
                        <pointLight
                            position={[-0.5, 0.3, -1.5]}
                            color="#ff0000"
                            intensity={2}
                            distance={3}
                        />
                        <pointLight
                            position={[0.5, 0.3, -1.5]}
                            color="#ff0000"
                            intensity={2}
                            distance={3}
                        />
                    </>
                )}
            </group>
        </group>
    )
}

export default CarController
export type { CubeState }
