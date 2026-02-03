import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import { Suspense, useState, useRef, useMemo } from 'react'
import { Group, Vector3 } from 'three'
import Terrain from './components/Terrain'
import CarController from './components/CarController'
import type { CubeState } from './components/CarController'

// Cube component that reads from shared state
function Cube({ state, index }: { state: CubeState, index: number }) {
  const lunarGravity = 0.005
  const airFriction = 0.98
  const groundLevel = 1

  useFrame(() => {
    if (state.fallen) return

    // Apply lunar gravity
    state.velocity.y -= lunarGravity

    // Apply air friction
    state.velocity.multiplyScalar(airFriction)

    // Update position
    state.position.add(state.velocity)

    // Ground collision
    if (state.position.y < groundLevel) {
      state.position.y = groundLevel
      state.velocity.y = 0
      // Extra friction when on ground
      state.velocity.x *= 0.95
      state.velocity.z *= 0.95
    }

    // Check if fallen off world
    if (state.position.y < -20) {
      state.fallen = true
    }
  })

  if (state.fallen) return null

  return (
    <mesh
      position={state.position.toArray()}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#7788aa" metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

function Game() {
  const worldRef = useRef<Group>(null)

  // Generate initial cube states
  const cubeStates = useRef<CubeState[]>(
    Array.from({ length: 40 }, () => ({
      position: new Vector3(
        (Math.random() - 0.5) * 180,
        1,
        (Math.random() - 0.5) * 180
      ),
      velocity: new Vector3(0, 0, 0),
      fallen: false
    }))
  )

  const handleRespawn = () => {
    // Reset all cubes
    cubeStates.current.forEach((cube, i) => {
      cube.position.set(
        (Math.random() - 0.5) * 180,
        1,
        (Math.random() - 0.5) * 180
      )
      cube.velocity.set(0, 0, 0)
      cube.fallen = false
    })
  }

  return (
    <>
      <Sky sunPosition={[100, 20, 50]} turbidity={8} rayleigh={0.3} />
      <Stars radius={300} depth={60} count={2000} />
      <fog attach="fog" args={['#ccaa88', 60, 200]} />

      <ambientLight intensity={1.2} /> {/* Brighter ambient for better overall lighting */}
      <directionalLight position={[50, 80, 30]} intensity={2.5} castShadow /> {/* Stronger main light */}
      <directionalLight position={[-30, 60, -20]} intensity={1.5} /> {/* Fill light from opposite side */}
      <spotLight
        position={[0, 40, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={1.5}
        castShadow
        target-position={[0, 0, 0]}
      /> {/* Spotlight following the car */}
      <hemisphereLight args={['#ffaa77', '#554433', 0.8]} /> {/* Stronger hemisphere */}

      {/* Car at origin */}
      <CarController
        worldRef={worldRef}
        cubeStates={cubeStates}
        onRespawn={handleRespawn}
      />

      {/* World moves around car */}
      <group ref={worldRef}>
        <Terrain />

        {/* Cubes with lunar physics */}
        {cubeStates.current.map((state, i) => (
          <Cube key={i} state={state} index={i} />
        ))}
      </group>
    </>
  )
}

function App() {
  const [started, setStarted] = useState(false)

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1a0a00' }}>
      {!started && (
        <div
          onClick={() => setStarted(true)}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(180deg, #cc4422 0%, #884422 40%, #221100 100%)',
            color: 'white', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 10, cursor: 'pointer', fontFamily: 'Arial, sans-serif'
          }}
        >
          <h1 style={{ fontSize: '3.5rem', margin: 0, textShadow: '4px 4px 0 #000' }}>
            COLIN'S CRAZY CARRERA
          </h1>
          <p style={{ fontSize: '1.3rem', marginTop: '20px', color: '#ffcc99' }}>
            Click to Play
          </p>
          <div style={{
            marginTop: '40px',
            fontSize: '1rem',
            textAlign: 'left',
            background: 'rgba(0,0,0,0.3)',
            padding: '20px 35px',
            borderRadius: '10px'
          }}>
            <p style={{ margin: '6px 0' }}>⬆️ / W - Accelerate</p>
            <p style={{ margin: '6px 0' }}>⬇️ / S - Reverse</p>
            <p style={{ margin: '6px 0' }}>⬅️ ➡️ / A D - Steer</p>
            <p style={{ margin: '6px 0' }}>Space - Brake</p>
            <p style={{ margin: '6px 0' }}>🖱️ Click & Drag - Rotate Camera</p>
          </div>
          <p style={{ marginTop: '30px', fontSize: '0.9rem', color: '#aa8866' }}>
            Push the cubes off the edge! Don't fall!
          </p>
        </div>
      )}
      <Canvas shadows camera={{ position: [0, 6, 12], fov: 60 }}>
        <Suspense fallback={null}>
          {started && <Game />}
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
