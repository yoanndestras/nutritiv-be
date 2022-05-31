import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import nutritivApi, { 
  } from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user'

const fields = {
  street: "Street",
  zip: "Postal code",
  city: "City",
  country: "Country",
  phoneNumber: "Phone number"
}
const isNumberField = ["zip", "phoneNumber"]

export const ProfileAddress = ({ userInfo }) => {
  const dispatch = useDispatch();
  const [userAddresses, setUserAddresses] = useState([])
  
  const [addressInput, setAddressInput] = useState({
    [fields.street]: "",
    [fields.zip]: "",
    [fields.city]: "",
    [fields.country]: "",
    [fields.phoneNumber]: ""
  })
  
  console.log('# userInfo :', userInfo)
  
  useEffect(() => {
    setUserAddresses(userInfo.addresses)
  }, [userInfo.addresses]);
  
  // ADDRESS INPUT CHANGE
  const handleChange = async (e) => {
    setAddressInput({
      ...addressInput,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmitAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      const { data } = await nutritivApi.put(
        `/users/addAddress/`,
        addressInput
      )
      dispatch(
        updateUser({addresses: data.userInfo.addressDetails})
      )
    } catch(err) {
      console.log(err)
    }
  }
  
  const handleDeleteAddress = async (e) => {
    const addressToDelete = e.target.name
    
    try {
      const { data } = await nutritivApi.delete(
        `/users/removeAddress/${addressToDelete}`
      )
      dispatch(
        updateUser({addresses: data.addressDetails})
      )
    } catch (err) {
      console.log('# /users/removeAddress :', err) 
    }
  }
  
  return (
    <div>
      <h3>
        Add address
      </h3>
      <form onSubmit={handleSubmitAddAddress}>
        {
          Object.keys(fields).map((field, i) => (
            <React.Fragment key={i}>
              <label htmlFor={field}>
                {fields[field]}:
              </label>
              <br />
              <input
                name={field}
                onChange={handleChange}
                placeholder="..."
                type={
                  isNumberField.includes(field) ? "number" : "text"
                }
                value={addressInput?.field}
              />
              <br />
            </React.Fragment>
          ))
        }
        <input type="submit" value="Add address" />
      </form>
      <br />
      <div>
      {
        userAddresses && userAddresses.length !== 0 ? (
          userAddresses.map((address, i) => (
            <React.Fragment key={address._id}>
              <details>
                <summary>Address {i+1}</summary>
                <span>{address.country}</span>
                <br />
                <span>{address.city}</span>
                <br />
                <span>{address.zip}</span>
                <br />
                <span>{address.street}</span>
                <br />
                <span>{address.phoneNumber}</span>
              </details>
              <button 
                name={address._id}
                onClick={handleDeleteAddress}
              >
                Delete address
              </button>
            </React.Fragment>
          ))
        ) : (
          <span>
            No address registered.
          </span>
        )
      }
      </div>
    </div>
  )
}
