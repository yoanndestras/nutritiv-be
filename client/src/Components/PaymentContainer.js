import React from 'react';
import nutritivApi from '../Api/nutritivApi';

export const PaymentContainer = () => {
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { data } = await nutritivApi.post(
        '/stripe/create-checkout-session',
      );
      window?.open(data.url, "_self");
      console.log('# stripe/create-checkout-session data :', data)
    } catch (err) {
      console.log('# stripe/create-checkout-session :', err)
    }
  }
  
  return (
    <div id="paymentContainer">
      <form>
        <button onClick={handleSubmit}>
          Checkout
        </button>
      </form>
    </div>
  )
}
