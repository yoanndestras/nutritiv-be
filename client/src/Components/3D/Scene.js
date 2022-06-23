import { Environment, OrbitControls, PerspectiveCamera, Plane, softShadows, Sparkles, useHelper } from '@react-three/drei'
import React, { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber';
import WeaponModel from './WeaponModel';

softShadows({
  frustum: 3.75,
  size: 0.005,
  near: 9.5,
  samples: 30,
  rings: 11, // Rings (default: 11) must be a int
})

export const Scene = () => {
  const directionalLightRef1 = useRef();
  const directionalLightRef2 = useRef();
  // useHelper(directionalLightRef1, DirectionalLightHelper, 1, "red")
  // useHelper(directionalLightRef2, DirectionalLightHelper, 1, "cyan")
  // useHelper(spotLightRef, SpotLightHelper, 'pink')
  
  // On every frame change
  useFrame(state => {
    // console.log('# test :', centerRef)
  })
  
  return (
    <Suspense fallback={null}>
      
      {/* CAMERA */}
      <PerspectiveCamera
        makeDefault
        fov={65}
        position={[10, 1, 0]}
      />

      {/* ENVIRONMENT */}
      {/* <Environment 
        background
        files={'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/evening_road_01_2k.hdr'}
      /> */}

      {/* MODEL */}
      <WeaponModel position={[0, 0.5, 0]}/>
      
      {/* GROUND */}
      {/* <Plane receiveShadow rotation-x={-Math.PI / 2} position={[0, -1.7, 0]} args={[10, 10, 4, 4]}>
        <meshBasicMaterial opacity={0.5} />
      </Plane> */}
      {/* SHADOW */}
      <Plane receiveShadow rotation-x={-Math.PI / 2} position={[0, -1.7, 0]} args={[10, 10, 4, 4]}>
        <shadowMaterial opacity={0.5} />
      </Plane>
      
      {/* LIGHTS */}
      {/* RIGHT */}
      <directionalLight
        castShadow
        intensity={2}
        position={[3, 5, -0.2]}
        ref={directionalLightRef1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* LEFT */}
      <directionalLight
        castShadow
        intensity={2}
        position={[-3, 5, 0.3]}
        ref={directionalLightRef2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* 
      <spotLight
        angle={angleToRadians(40)} 
        castShadow
        decay={2}
        distance={16}
        penumbra={1}
        position={[6,1.5,0]}
        power={10}
        ref={spotLightRef}
      />
      */}
      <ambientLight intensity={1}/> 
      
      {/* CONTROLS */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={1}
        enablePan
        enableZoom={true}
        enableRotate={true}
        makeDefault
      />
      
    </Suspense>
  )
}