import React, { useReducer } from 'react'
import nutritivApi from '../../Api/nutritivApi'

const reducer = (prevState, action) => {
  const { type, key, value } = action;
  
  if(type === 'INPUT') {
    return {
      ...prevState,
      inputs: {
        ...prevState.inputs,
        [key]: value
      }
    } 
  } else if(type === 'CLEAR_INPUTS') {
    const clearedInputs = Object.keys(prevState.inputs).map(v => (
      prevState.inputs[v] = ""
    ))
    return {
      ...prevState,
      inputs: clearedInputs
    }
  } else if(type === 'API') {
    return {
      ...prevState,
      [key]: value,
    }
  } else if(type === 'LOADING') {
    return {
      ...prevState,
      [key]: value
    }
  } else if(type === 'ERROR') {
    return {
      ...prevState,
      errors: {
        ...prevState.errors,
        [key]: value
      }
    }
  } else {
    throw new Error(`useReducer -> ${type} does not exists`);
  }
}

export const ProfilePassword = () => {
  
  const [state, dispatch] = useReducer(reducer, {
    inputs: {
      oldPass: "",
      newPass: "",
      confirmNewPass: "",
    },
    errors: {
      isEmpty: false,
      isNotMatching: false,
    },
    loading: false,
    response: null
  })
  const { inputs, errors, loading, response } = state;
  
  const changeState = (type, key, value) => {
    dispatch({ type, key, value })
  }
  
  const passwordInputsValidation = () => {  
    
    changeState('API', 'response', null)
    let passwordEmpty = false;
    let passwordNotMatching = false;
    
    if(
      !inputs.oldPass ||
      !inputs.newPass ||
      !inputs.confirmNewPass
    ) {
      changeState('ERROR', 'isEmpty', true)
      passwordEmpty = true;
    } else {
      changeState('ERROR', 'isEmpty', false)
    }
    
    if(inputs.newPass !== inputs.confirmNewPass) {
      changeState('ERROR', 'isNotMatching', true)
      passwordNotMatching = true;
    } else {
      changeState('ERROR', 'isNotMatching', false)
    }
    return !passwordEmpty && !passwordNotMatching
  }
  
  const handleSubmitUpdatePassword = async (e) => {
    e.preventDefault()
    
    const isValid = passwordInputsValidation();
    
    if(isValid) {
      changeState('LOADING', 'serverResponse', true)
      changeState('CLEAR_INPUTS')
      try {
        const { data } = await nutritivApi.put(
          `/users/reset_password`,
          inputs
        )
        changeState('API', 'response', data)
        changeState('CLEAR_INPUTS')
      } catch (err) {
        changeState('API', 'response', {})
        console.log("# /users/reset_password :", err)
      }
      changeState('LOADING', 'serverResponse', false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmitUpdatePassword}>
        <span>
          <h3>
            Password
          </h3>
          <br />
          <input
            onChange={e =>
              changeState('INPUT', 'oldPass', e.target.value)
            }
            name='oldPass'
            placeholder='Current password...'
            type="password"
            value={inputs.oldPass}
          />
          <br />
          <input
            onChange={e =>
              changeState('INPUT', 'newPass', e.target.value)  
            }
            name='newPass'
            placeholder='New password...'
            type="password"
            value={inputs.newPass}
          />
          <br />
          <input
            onChange={e =>
              changeState('INPUT', 'confirmNewPass', e.target.value)
            }
            name='confirmNewPass'
            placeholder='Confirm new password...'
            type="password"
            value={inputs.confirmNewPass}
          />
          <br />
          <input
            type="submit"
            value="Change password"
          />
          <br />
          { 
            errors.isNotMatching && (
              <span style={{color: "red"}}>
                The password does not match the confirmation field.
              </span>
            )
          }
          <br />
          { 
            errors.isEmpty && (
              <span style={{color: "red"}}>
                Please fill in all the fields.
              </span>
            )
          }
          <br />
          {
            loading && (
              <span>
                Loading...
              </span>
            )
          }
          <br />
          {
            response && (
              response.success ? (
                <span style={{color: "green"}}>
                  Password successfully changed.
                </span>
              ) : (
                <span style={{color: "red"}}>
                  There was an error changing your password.
                </span>
              )
            )
          }
        </span>
      </form>
    </div>
  )
}
