import React, {
  forwardRef,
  useEffect, 
  useState 
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import nutritivApi, { s3URL } from '../../Api/nutritivApi';
import { updateUserCartQuantity } from '../../Redux/reducers/user';
import { motion } from 'framer-motion';

const ProductPage = forwardRef((props, ref) => {
  const loggedIn = useSelector(state => state.user.loggedIn)
  const dispatch = useDispatch();
  const { productTitle } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState({
    productItems: []
  })
  const [cartSelection, setCartSelection] = useState({
    // productId: "", <- Added at apiGetProductByTitle()
    load: 0,
    price: 0,
    quantity: 0,
  })
  const [countInStock, setCountInStock] = useState(0)
  const [availableQuantity, setAvailableQuantity] = useState(0)
  const [updateStock, setUpdateStock] = useState(false)
  
  const [loadingAdding, setLoadingAdding] = useState(false)
  const [successAddedToCart, setSuccessAddedToCart] = useState(false)
  const [errorOutOfStock, setErrorOutOfStock] = useState(false)
  
  // HANDLE ADD TO CART
  const handleAddToCart = async (loc) => {
    const selection = loc?.cartSelection ? loc.cartSelection : cartSelection
    
    if(loggedIn){
      setLoadingAdding(true)
      try {
        const { data } = await nutritivApi.post(
          `carts/addToCart`,
          selection
        );
        dispatch(
          updateUserCartQuantity(data.cart.totalQuantity)
        )
        setUpdateStock(!updateStock);
        setLoadingAdding(false)
        setSuccessAddedToCart(true);
        setCartSelection(prevState => ({
          productId: prevState.productId,
          load: 0,
          price: 0,
          quantity: 0,
        }))
        setAvailableQuantity(0)
      } catch (err) {
        setLoadingAdding(false)
        console.log('# apiAddToCart err :', err)
      }
    } else {
      navigate(
        '/login',
        { state: 
          { 
            msg: "Login to add a product to your cart.",
            cartSelection,
            from: `/product/${productTitle}`
          }
        }
      );
    }
  }
  
  useEffect(() => {
    let isMounted = true;
    if(isMounted) {
      if(location.state?.cartSelection?.productId) {
        setCartSelection(location.state.cartSelection);
        handleAddToCart({cartSelection: location.state.cartSelection});
      }
    }
    return () => { isMounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // GET PRODUCT (by title)
  useEffect(() => {
    let isMounted = true;
    try {
      async function fetchApi() {
        const { data } = await nutritivApi.get(
          `/products/findByTitle/${productTitle}`
        )
        if(isMounted){
          const fetchedProduct = data.Product[0]
          setProduct(fetchedProduct);
          
          if(location.state?.productId){
            setCartSelection(location.state)
          } else {
            setCartSelection(prevState => ({
              ...prevState,
              productId: fetchedProduct._id
            }))
          }
        }
      }
      fetchApi();
    } catch (err) {
      console.log('# /products/findByTitle err :', err)
    }
    return () => { isMounted = false }
  }, [productTitle, location.state])
  
  // HANDLE SELECTED ITEM
  const handleSelectedItem = (item) => {
    setSuccessAddedToCart(false)
    if(countInStock >= item.load) { 
      item.quantity = 1
      setErrorOutOfStock(false)
    } else { 
      setErrorOutOfStock(true) 
    }
    const { load, price, quantity } = item;
    setCartSelection(prevState => ({
      ...prevState,
      load,
      price,
      quantity
    }))
  }

  // GET STOCK
  useEffect(() => {
    let isMounted = true;
    if(product._id) {
      try {
        async function fetchApi() {
          const { data } = await nutritivApi.get(
            `/products/countInStock/${product._id}`
          );
          if(isMounted){
            setCountInStock(data.countInStock)
          }
        }
        fetchApi();
      } catch (err) {
        console.log('# apiGetCountInStock err :', err)
      }
    }
    return () => { isMounted = false }
  }, [updateStock, product._id]);
  
  // HANDLE QUANTITY
  const handleSelectedQuantity = (quantity) => {
    setCartSelection(prevState => ({...prevState, quantity}))
  }
  useEffect(() => {
    if(cartSelection.load && countInStock){
      setAvailableQuantity(Math.floor(countInStock / cartSelection.load))
    }
  }, [cartSelection.load, countInStock]);

  return (
    <motion.div>
      <h2>
        { product.title }
      </h2>
      {
        product.imgs?.map((img, i) => (
          <img
            key={i}
            src={
              `${s3URL}${img}`
            } 
            alt={`product ${i}`} 
          />
        ))
      }
      <div>
        {/* RADIO BUTTON */}
        <b>
          Load:
        </b>
        <br />
        {
          product.productItems.map((item, i) => (
            <React.Fragment key={i}>
              <input
                checked={cartSelection.load === item.load}
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
        errorOutOfStock && <p style={{color: "red"}}>Not enough stock</p>
      }
      <br />
      {/* DROPDOWN */}
      <b>
        Quantity:
      </b>
      <br />
      {
        <select
          disabled={!availableQuantity}
          id={product._id}
          name="quantity" 
          onChange={(e) => handleSelectedQuantity(e.target.value)}
        >
          {
            (cartSelection.productId && availableQuantity) && (
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
      <br />
      <br />
      {/* BUTTON */}
      <button
        disabled={!cartSelection.quantity}
        onClick={handleAddToCart}
      >
        Add to cart
      </button>
      {/* SUCCESS */}
      {
        successAddedToCart && (
          <p style={{color: "green"}}>
            Successfully added {productTitle}!
          </p>
        ) 
      }
      {/* LOADING */}
      {
        loadingAdding && <p>Adding {productTitle} to cart...</p>
      }
    </motion.div>
  )
});

export default ProductPage;