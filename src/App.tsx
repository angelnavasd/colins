import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles, Grid } from '@react-three/drei'
import { Suspense, useState, useRef } from 'react'
import { Group, Vector3, Fog, Color } from 'three'
import CarController from './components/CarController'
import { Sun } from './components/Sun'
import { InfiniteRoad } from './components/InfiniteRoad'
import { SideProps } from './components/SideProps'
import { HorizonSkyline } from './components/HorizonSkyline'
import type { CubeState } from './components/CarController'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Cube component that reads from shared state
function Cube({ state }: { state: CubeState }) {
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
        (Math.random() - 0.5) * 35, // Stay on or near the road Haus Haus Haus
        1,
        (Math.random() - 0.5) * 400 // Distributed along a longer stretch Haus Haus Haus Haus
      ),
      velocity: new Vector3(0, 0, 0),
      fallen: false
    }))
  )

  const handleRespawn = () => {
    // Reset all cubes
    cubeStates.current.forEach((cube) => {
      cube.position.set(
        (Math.random() - 0.5) * 180,
        1,
        (Math.random() - 0.5) * 180
      )
      cube.velocity.set(0, 0, 0)
      cube.fallen = false
    })
  }

  // Set scene fog and background - Lighter sky to contrast dark buildings
  useFrame(({ scene }) => {
    if (!scene.fog || (scene.fog as any).isFogExp2) {
      // Lighter purple sky so stars pop against it
      scene.fog = new Fog('#1a0033', 15, 250)
      scene.background = new Color('#0d001a') // Dark purple sky (not black)
    }
  })

  return (
    <>
      <Stars radius={400} depth={100} count={5000} factor={6} saturation={0} fade speed={2} />

      {/* Floating atmospheric particles */}
      <Sparkles count={100} scale={[50, 20, 200]} size={2} speed={0.3} color="#ff88ff" opacity={0.5} />

      {/* RETROWAVE GRID - Subtle infinite grid */}
      <Grid
        position={[0, -0.1, 0]}
        args={[300, 300]}
        cellSize={8}
        cellThickness={0.5}
        cellColor="#003344"
        sectionSize={40}
        sectionThickness={1}
        sectionColor="#004455"
        fadeDistance={250}
        fadeStrength={2}
        infiniteGrid
      />

      {/* HORIZON SKYLINE - Depth */}
      <HorizonSkyline />

      {/* DARKER AMBIENT - Let point lights do the work */}
      <ambientLight intensity={0.3} color="#200040" />

      {/* STRONG SUN LIGHT from horizon */}
      <directionalLight position={[0, 50, -200]} intensity={2} color="#ff6600" />
      <directionalLight position={[0, 30, -100]} intensity={1} color="#ff00cc" />

      {/* Post Processing - Clean bloom only */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.9} height={200} intensity={0.8} mipmapBlur />
      </EffectComposer>


      {/* Static Background Elements */}
      <Sun />

      {/* Car Control & Moving World */}
      <CarController
        worldRef={worldRef}
        cubeStates={cubeStates}
        onRespawn={handleRespawn}
      />

      {/* The Moving World Group */}
      <group ref={worldRef}>
        {/* Replaced Terrain with Procedural System */}
        <InfiniteRoad />
        <SideProps />

        {/* Keeping Cubes for gameplay */}
        {cubeStates.current.map((state, i) => (
          <Cube key={i} state={state} />
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
