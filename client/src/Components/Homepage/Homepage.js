import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSelector } from 'react-redux';
import styles from './Homepage.module.scss';
import { Scene } from '../3D/Scene';

const releases = [
  {
    version: "v1.4.0",
    note: "",
    changes: [
      "3D models",
    ]
  },
  {
    version: "v1.3.0",
    note: "",
    changes: [
      "ReCaptcha",
    ]
  },
  {
    version: "v1.2.0",
    note: "",
    changes: [
      "Account Deletion",
    ]
  },
  {
    version: "v1.1.0",
    note: "",
    changes: [
      "2FA Authentication (Enable/Disable)",
    ]
  },
  {
    version: "v1.0.1",
    note: "",
    changes: [
      "Fixed third party authentication link",
    ],
  },
  {
    version: "v1.0.0",
    note: "- Alpha release (no design included)",
    changes: [
      "Register / Login with email",
      "Register / Login with third party websites",
      "Edit profile information",
      "Displaying & filtering products",
      "Add to cart / Remove from cart",
      "Buy products with stripe (using test credit card)",
      "Real-time chat",
    ],
  },
]

export const Homepage = () => {
  const loggedIn = useSelector(state => state.user.loggedIn)
  
  const pageAnimation = {
    exit: {
      opacity: 0,
      transition: {
        default: { duration: 0.4 },
      },
    },
  }

  return (
    <div 
      variants={pageAnimation} 
      exit="exit"
    >
      <br />
      <div>
        <div style={{border: "1px solid grey", backgroundColor: "white"}}>
          <p>
            <b>Important note(s):</b>
          </p>
          <div style={{color: "brown"}}>
            <span role="note" aria-label='note'>
              ⚠️
            </span> 
            This project is work in progress, but feel free to look around & create an account.
          </div>
          <br />
          <div style={{color: "green"}}>
            {
              releases.map((release, i) => (
                <React.Fragment key={i}>
                  <span role="note" aria-label='checkmark'>
                    ✔️
                  </span>
                  <span>
                    {release.version} {release.note}
                  </span>
                  <br />
                  <ul>
                    {
                      release.changes.map((change, i) => (
                        <li key={i}>
                          {change}
                        </li>
                      ))
                    }
                  </ul>
                </React.Fragment>
              ))
            }
          </div>
        </div>
        <h1 className={styles.title}>
          <span
            whilehover={{opacity: 0.5}}
          >
            Homepage
          </span>
        </h1>
      </div>
      
      {/* THREE JS TESTING */}
      <div style={{
          background: "transparent", 
          height: "500px", 
          width: "500px"
      }}>
        <Canvas shadows>
          <Scene type="pill" />
        </Canvas>
      </div>
      <div style={{
          background: "transparent", 
          height: "500px", 
          width: "500px"
      }}>
        <Canvas shadows>
          <Scene type="jelly" />
        </Canvas>
      </div>
      
      {/* ---------------- */}
      {
        !loggedIn && (
          <div>
            You are not connected
          </div>
        )
      }
    </div>
  )
}