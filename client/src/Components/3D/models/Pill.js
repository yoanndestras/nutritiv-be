import React, { useRef, useState } from 'react'
import { Sparkles, Stats, useGLTF } from '@react-three/drei'
import angleToRadians from '../../../Helpers/angleToRadians'
import { useFrame } from '@react-three/fiber'

export default function Model({ ...props }) {
  const modelRef = useRef(0);
  const { nodes, materials } = useGLTF('/model-pill-water.glb')
  
  // useFrame(() => {
  //   modelRef.current.rotation.y += 0.01
  // })
  
  return (
    <group ref={modelRef}>
      <group 
        dispose={null}
        rotation={[angleToRadians(30), 0, 0]}
        scale={12}
        {...props}
      >
        <group scale={0.1} position={[0.002,0,0.004]}>
          <mesh castShadow geometry={nodes.Sphere.geometry} material={materials['lambert2.003']}    position={[-0.1, 0.2, 0.1]}                                   scale={0.06} />
          <mesh castShadow geometry={nodes.Sphere001.geometry} material={materials['lambert2.003']} position={[0.1, 0.1, -0.1]}  rotation={[1.84, 0, 0]}          scale={0.05} />
          <mesh castShadow geometry={nodes.Sphere002.geometry} material={materials['lambert2.003']} position={[0.1, 0.6, 0]}                                      scale={0.06} />
          <mesh castShadow geometry={nodes.Sphere003.geometry} material={materials['lambert2.003']} position={[-0.1, 0.5, 0]}                                     scale={0.04} />
          <mesh castShadow geometry={nodes.Sphere004.geometry} material={materials['lambert2.003']} position={[-0.2, 0.2, -0.1]} rotation={[0, 1.38, 0]}          scale={0.05} />
          <mesh castShadow geometry={nodes.Sphere005.geometry} material={materials['lambert2.003']} position={[0.06, 0.4, -0.2]}  rotation={[0, -1.3, 0]}         scale={0.06} />
          <mesh castShadow geometry={nodes.Sphere006.geometry} material={materials['lambert2.003']} position={[-0.1, 0.3, -0.2]} rotation={[0, 0, 1.12]}          scale={0.01} />
          <mesh castShadow geometry={nodes.Sphere007.geometry} material={materials['lambert2.003']} position={[0, 0.3, 0]}       rotation={[1.53, 0, 3.1]}        scale={0.07} />
          <mesh castShadow geometry={nodes.Sphere008.geometry} material={materials['lambert2.003']} position={[0.1, 0.3, 0.1]}   rotation={[1.86, 1.1, -1.83]}    scale={0.02} />
          <mesh castShadow geometry={nodes.Sphere009.geometry} material={materials['lambert2.003']} position={[0, 0.3, 0.2]}                                      scale={0.02} />
          <mesh castShadow geometry={nodes.Sphere010.geometry} material={materials['lambert2.003']} position={[-0.2, 0.4, 0]}                                     scale={0.02} />
          <mesh castShadow geometry={nodes.Sphere011.geometry} material={materials['lambert2-emissive.001']} position={[-0.1, 0.2, 0]}                                     scale={0.02} />
          <mesh castShadow geometry={nodes.Sphere012.geometry} material={materials['lambert2-emissive.001']} position={[0.2, 0.05, 0.07]} rotation={[1.3, -0.64, -0.16]}   scale={0.03} />
          <mesh castShadow geometry={nodes.Sphere013.geometry} material={materials['lambert2-emissive.001']} position={[0, 0.5, 0]}                                        scale={0.03} />
        </group>
        <mesh castShadow geometry={nodes.polySurface3_1001.geometry} material={materials['standardSurface3.002']} position={[0, -0.05, 0]} scale={0.03} />
        <mesh castShadow geometry={nodes.polySurface3_2001.geometry} material={materials.transparent_cap}         position={[0, 0.042, 0]} scale={0.03} />
      </group>
    </group>
  )
}

useGLTF.preload('/model-pill-water.glb')
