import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import nutritivApi from '../../Api/nutritivApi';
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
      {
        cart ? (
          cart.products.map(product => (
            <div key={product.productId}>
              <hr/>
              <h3>
                Product id: {product.productId}
              </h3>
              {
                product.productItems.map(item => (
                  <React.Fragment key={item.id}>
                    <h4>Item id: {item.id}</h4>
                    <h4>Quantity: {item.quantity}</h4>
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
        ) : (
          <h2>Cart is empty!</h2>
        )
      }
      <br />
      <PaymentContainer />
    </div>
  )
}
