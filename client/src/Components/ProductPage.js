import React, { 
  useCallback,
  useEffect, 
  useState 
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import nutritivApi from '../Api/nutritivApi';
import { updateUserCartQuantity, updateUserCartSelectionToAdd } from '../Redux/reducers/user';

export const ProductPage = () => {
  const loggedIn = useSelector(state => state.user.loggedIn)
  const cartSelectionToAdd = useSelector(state => state.user.cartSelectionToAdd)
  const dispatch = useDispatch();
  const { productTitle } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productItems: []
  })
  const [selectedItem, setSelectedItem] = useState({
    // productId: "", <- Added at apiGetProductByTitle()
    load: 0,
    price: 0,
    quantity: 0,
  })
  const [countInStock, setCountInStock] = useState(0)
  const [availableQuantity, setAvailableQuantity] = useState(0)
  const [errorOutOfStock, setErrorOutOfStock] = useState(false)
  const [updateStock, setUpdateStock] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  
  console.log('# selectedItem :', selectedItem)
  
  // HANDLE ADD TO CART
  const handleAddToCart = async () => {
    if(loggedIn){
      try {
        const { data } = await nutritivApi.post(
          `carts/addToCart`,
          selectedItem
        );
        dispatch(
          updateUserCartQuantity(data.cart.totalQuantity)
        )
        dispatch(
          updateUserCartSelectionToAdd(null)
        )
        setUpdateStock(!updateStock);
        setAddedToCart(true);
        setSelectedItem(prevState => ({
          productId: prevState.productId,
          load: 0,
          price: 0,
          quantity: 0,
        }))
        setAvailableQuantity(0)
      } catch (err) {
        console.log('# apiAddToCart err :', err)
      }
    } else {
      dispatch(
        updateUserCartSelectionToAdd(selectedItem)
      )
      navigate('/login')
    }
  }
  
  // GET PRODUCT (by title)
  useEffect(() => {
    try {
      async function fetchApi() {
        const { data } = await nutritivApi.get(
          `/products/findByTitle/${productTitle}`
        )
        const fetchedProduct = data.Product[0]
        setProduct(fetchedProduct);
        if(cartSelectionToAdd?.productId){
          setSelectedItem(cartSelectionToAdd)
        } else {
          setSelectedItem(prevState => ({
            ...prevState,
            productId: fetchedProduct._id
          }))
        }
      }
      fetchApi();
    } catch (err) {
      console.log('# /products/findByTitle err :', err)
    }
  }, [productTitle, cartSelectionToAdd])

  useEffect(() => {
    if(
      cartSelectionToAdd && 
      selectedItem.productId && 
      selectedItem.quantity > 0
    ) {
      handleAddToCart();
    }
  });
  
  // HANDLE SELECTED ITEM
  const handleSelectedItem = (item) => {
    if(countInStock >= item.load) { 
      item.quantity = 1
      setErrorOutOfStock(false)
    } else { setErrorOutOfStock(true) }
    const { load, price, quantity } = item;
    setSelectedItem(prevState => ({
      ...prevState,
      load,
      price,
      quantity
    }))
  }

  // GET STOCK
  useEffect(() => {
    if(product._id) {
      try {
        async function fetchApi() {
          const { data } = await nutritivApi.get(
            `/products/countInStock/${product._id}`
          );
          setCountInStock(data.countInStock)
        }
        fetchApi();
      } catch (err) {
        console.log('# apiGetCountInStock err :', err)
      }
    }
  }, [updateStock, product._id]);

  // HANDLE QUANTITY
  const handleSelectedQuantity = (quantity) => {
    setSelectedItem(prevState => ({...prevState, quantity}))
  }
  useEffect(() => {
    if(selectedItem.load && countInStock){
      setAvailableQuantity(Math.floor(countInStock / selectedItem.load))
    }
  }, [selectedItem.load, countInStock]);
  
  console.log('# availableQuantity :', availableQuantity)

  return (
    <>
      <h2>
        { product.title }
      </h2>
      <div>
        {/* RADIO BUTTON */}
        {
          product.productItems.map((item, i) => (
            <React.Fragment key={i}>
              <input 
                id={`${product._id}${item.load}`} 
                name={product._id}
                onChange={() => handleSelectedItem({
                  load: item.load,
                  price: item.price.value,
                })}
                type="radio" 
                value={item.load}
              />
              <label htmlFor={i}>
                {item.load}
              </label>
            </React.Fragment>
          ))
        }
      </div>
      {
        errorOutOfStock && <p style={{color: "red"}}>Out of stock</p>
      }
      {/* DROPDOWN */}
      {
        <select 
          disabled={!availableQuantity}
          id={product._id}
          name="quantity" 
          onChange={(e) => handleSelectedQuantity(e.target.value)}
        >
          {
            (selectedItem.productId && availableQuantity) && (
              [...Array(availableQuantity)].map((e, i) => (
                <option 
                  key={i}
                  value={e}
                >
                  {i+1}
                </option>
              ))
            )
          }
        </select>
      }
      <button
        disabled={!selectedItem.quantity}
        onClick={handleAddToCart}
      >
        Add to cart
      </button>
      {
        addedToCart && (
          <p style={{color: "green"}}>
            Successfully added {productTitle}!
          </p>
        ) 
      }
      {
        cartSelectionToAdd && <p>Adding {productTitle} to cart...</p>
      }
    </>
  )
}
