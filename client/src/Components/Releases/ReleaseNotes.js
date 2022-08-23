import React from 'react';
import releases from './releases.json';

export const ReleaseNotes = () => {
  return (
    <div style={{border: "1px solid grey", backgroundColor: "white"}}>
      <h1>
        <b>Releases</b>
      </h1>
      {/* 
      <div style={{color: "brown"}}>
        <span role="note" aria-label='note'>
          ⚠️
        </span> 
        This project is work in progress, but feel free to look around & create an account.
      </div>
      <br /> 
      */}
      <div style={{color: "green"}}>
        {
          releases && releases.map((release, i) => (
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
  )
}