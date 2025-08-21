import { all } from "axios";

const initialState = {
  
  // User-related state
  userId: null,
  userNumber: null,
  shoppingMode: null,
  // Cart Data
  viewCartData: {},

  // user address 
  viewAddressData: [],

  // user select address 
  selectAddressData: [],

  // Refresh or Loader
  reFresh: false,
  isLoader: false,
  isWishlistRefresh: false,
  isCartLoader: false,
  isHomeRefresh: false,

  isOrderRefresh: false,

  productFilter: null,

  // order navigation 
  orderNavigation: null,

    // Coupon Data
    couponData: {
      couponCode: '',
      discountAmount: 0,
      isCouponApplied: false,
    },

    // Notification expo token 
    expoToken: null,
};

export default initialState;
