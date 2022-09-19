import React, { forwardRef } from 'react';
import releases from './releases.json';

const ReleaseNotes = forwardRef((props, ref) => {
  return (
    <div style={{border: "1px solid grey", backgroundColor: "white"}}>
      <h1>
        <b>Releases</b>
      </h1>
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
});

export default ReleaseNotes;