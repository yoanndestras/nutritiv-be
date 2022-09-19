import React, { forwardRef, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

const CanvasDefaultList = forwardRef((props, ref) => {
  const refsNames = require("../../Helpers/canvasRefs.json");
  const refs = Object.fromEntries(refsNames.map((prop) => [prop, ref[prop]]));
  
  return (
    <>
      {Object.values(refs).map((ref, i) => (
        <div 
          className={`default-canvas-${i}`} 
          key={i} 
          ref={ref}
          style={{display: "none"}} 
        />
      ))}
    </>
  )
});

export default CanvasDefaultList;