import React, { useEffect, useReducer, useState } from 'react'
import { useSelector } from 'react-redux';
import nutritivApi from '../Api/nutritivApi';


export const Welcome = () => {
  const [formData, setFormData] = useState({})
  
  const loggedIn = useSelector(state => state.user.loggedIn)
  
  // useEffect(() => {
  //   if(localStorage) {
  //     const formDataFromLocalStorage = localStorage.getItem('formData');
  //     if(formDataFromLocalStorage) {
  //       const formDataCopy = JSON.parse(formDataFromLocalStorage)
  //       setFormData({...formDataCopy})
  //     }
  //   }
  // }, []);
  
  // useEffect(() => {
  //   localStorage && localStorage.setItem("formData", JSON.stringify(formData))
  // }, [formData]);
  
  // const handleInputsChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value
  //   })
  // }
  
  return (
    <div>
      <br />
      <input 
        type="text" 
        name="firstName"
        placeholder='first name'
        // onChange={e => handleInputsChange(e)}
        value={formData?.firstName}
      />
      <input 
        type="text" 
        name="lastName"
        placeholder='last name'
        // onChange={e => handleInputsChange(e)}
        value={formData?.lastName}
      />
      
      
      <h1>Homepage</h1>
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