import React, { forwardRef } from 'react'

const PageNotFound = forwardRef((props, ref) => {
  // Drei Canvas Refs //
  const refsNames = require("../../Helpers/canvasRefs.json");
  const refs = Object.fromEntries(refsNames.map((prop) => [prop, ref[prop]]));
  
  return (
    <div>
      <div ref={refs.canvasView1} style={{ height: "100px", width: "100px" }}/>
      <br /> 
      <h2 style={{marginBottom: "2000px"}}>
        404 | Page not found
      </h2>
    </div>
  )
});

export default PageNotFound;