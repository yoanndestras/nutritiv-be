import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import nutritivApi, { s3URL } from '../../Api/nutritivApi';
import { updateUserCartQuantity } from '../../Redux/reducers/user';
import { PaymentContainer } from './PaymentContainer';

export const Cart = () => {
  const dispatch = useDispatch();
  const [cart, setCart] = useState(null)
  const [deletedItem, setDeletedItem] = useState(false)
  
  useEffect(() => {
    async function fetchApi() {
      try {
        const { data } = await nutritivApi.get(
          `/carts/self`
        )
        dispatch(
          updateUserCartQuantity(data.cart?.totalQuantity)
        )
        setCart(data.cart)
        console.log('# data.cart :', data.cart)
      } catch(err) {
        console.log('apiGetSelfCart() err :', err)
      }
    }
    fetchApi();
  }, [deletedItem, dispatch]);
  
  const handleRemoveCartItem = async (productId, id) => {
    try {
      await nutritivApi.delete(
        `/carts/${cart.userId}/${productId}/${id}`
      )
      setDeletedItem(!deletedItem);
    } catch (err) {
      console.log('# [DEL] /carts/ :', err)
    }
  }
  
  return (
    <div>
      <h1>
        Cart
      </h1>
      {
        cart ? (
          <>
            {
              cart.products.map(product => (
                <div key={product.productId}>
                  <hr/>
                  <h2 style={{background: "lightgrey"}}>
                    {product.productTitle}
                  </h2>
                  {
                    product.productImgs.map((img, i) => (
                      <img
                        src={`${s3URL}${img}`}
                        alt={`${product.productTitle}-${i}`}
                      />
                    ))
                  }
                  {
                    product.productItems.map(item => (
                      <React.Fragment key={item.id}>
                        <h3>Load: {item.load}</h3>
                        <h4>Quantity: {item.quantity}</h4>
                        <h4>{item.price.value} {item.price.currency}</h4>
                        <button 
                          onClick={() => handleRemoveCartItem(
                            product.productId, 
                            item.id
                          )}
                        >
                          X
                        </button>
                      </React.Fragment>
                    ))
                  }
                </div>
              ))
            }
            <hr />
            <h4>
              Total: {cart.amount.value} {cart.amount.currency}
            </h4>
          </>
        ) : (
          <h2>Cart is empty!</h2>
        )
      }
      <br />
      <PaymentContainer />
    </div>
  )
}
