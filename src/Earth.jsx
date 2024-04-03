/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 .\public\models\earth.glb 
Author: AirStudios (https://sketchfab.com/sebbe613)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/earth-5f9c35be31a047928eace8b415a8ee3a
Title: Earth
*/

import React, { useRef, useState } from "react";
import {
  PointMaterial,
  Points,
  useAnimations,
  useGLTF,
} from "@react-three/drei";

export function Model(props) {
  const { nodes, materials } = useGLTF("models/earth.glb");
  return (
    <group {...props} dispose={null}>
      <group scale={96.724}>
        <mesh
          geometry={nodes.pSphere1_phong1_0.geometry}
          material={materials.phong1}
        />
        <mesh
          geometry={nodes.pSphere1_phong1_0_1.geometry}
          material={materials.phong1}
        />
      </group>
      <group scale={97.464}>
        <mesh
          geometry={nodes.pSphere4_lambert6_0.geometry}
          material={materials.lambert6}
        />
        <mesh
          geometry={nodes.pSphere4_lambert6_0_1.geometry}
          material={materials.lambert6}
        />
      </group>
      <group scale={98.098}>
        <mesh
          geometry={nodes.pSphere5_lambert7_0.geometry}
          material={materials.lambert7}
        />
        <mesh
          geometry={nodes.pSphere5_lambert7_0_1.geometry}
          material={materials.lambert7}
        />
      </group>
    </group>
  );
}

useGLTF.preload("models/earth.glb");
