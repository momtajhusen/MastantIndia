import initialState from './initialState';

// Action Types
const SET_USER = 'SET_USER';
const CLEAR_USER = 'CLEAR_USER';

const GLOBAL_REFRESH = 'GLOBAL_REFRESH';
const VIEW_CART_DATA = 'VIEW_CART_DATA';
const VIEW_ADDRESS_DATA = 'VIEW_ADDRESS_DATA';
const SELECT_ADDRESS_DATA = 'SELECT_ADDRESS_DATA';
const SET_LOADER = 'SET_LOADER';
const SET_CART_LOADER = 'SET_CART_LOADER';
const SET_PRODUCT_FILTER = 'SET_PRODUCT_FILTER';
const SET_ORDER_NAVIGATION = 'SET_ORDER_NAVIGATION';
const WISHLIST_REFRESH = 'WISHLIST_REFRESH';
const HOME_REFRESH = 'HOME_REFRESH';
const ORDER_REFRESH = 'ORDER_REFRESH';

const RESET_STATE = 'RESET_STATE';

const SET_COUPON = 'SET_COUPON';
const CLEAR_COUPON = 'CLEAR_COUPON';

const SET_EXPO_TOKEN = 'SET_EXPO_TOKEN';


// Reducer
const Reducer = (state = initialState, action) => {
  switch (action.type) {
    // User actions
    case SET_USER:
      return {
        ...state,
        userId: action.payload.userId,
        userNumber: action.payload.userNumber,
        shoppingMode: action.payload.shoppingMode,
      };
    case CLEAR_USER:
      return {
        ...state,
        userId: null,
        userNumber: null,
        shoppingMode: null,
      };

    case GLOBAL_REFRESH:
      return {
        ...state,
        reFresh: action.payload,
      };

    case WISHLIST_REFRESH:
      return {
        ...state,
        isWishlistRefresh: action.payload,
      };

      case SET_EXPO_TOKEN:
        return {
          ...state,
          expoToken: action.payload.expoToken,
        };

    case HOME_REFRESH:
      return {
        ...state,
        isHomeRefresh: action.payload,
      };

      case ORDER_REFRESH:
        return {
          ...state,
          isOrderRefresh: action.payload,
        };

    case SET_LOADER:
      return {
        ...state,
        isLoader: action.payload,
      };

    case SET_CART_LOADER:
      return {
        ...state,
        isCartLoader: action.payload,
      };

    case VIEW_CART_DATA:
      return {
        ...state,
        viewCartData: action.payload.viewCartData,
      };

    case SET_PRODUCT_FILTER:
      return {
        ...state,
        productFilter: action.payload.productFilter,
      };

    case VIEW_ADDRESS_DATA:
      return {
        ...state,
        viewAddressData: action.payload.viewAddressData,
      };

      case SELECT_ADDRESS_DATA:
        return {
          ...state,
          selectAddressData: action.payload.selectAddressData,
        };
      

    case SET_ORDER_NAVIGATION:
      return {
        ...state,
        orderNavigation: [action.payload.orderNavigation],
      };

       // Coupon actions
    case SET_COUPON:
      return {
        ...state,
        couponData: {
          couponCode: action.payload.couponCode,
          discountAmount: action.payload.discountAmount,
          isCouponApplied: true,
        },
      };

    case CLEAR_COUPON:
      return {
        ...state,
        couponData: {
          couponCode: '',
          discountAmount: 0,
          isCouponApplied: false,
        },
      };

    case RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

export default Reducer;
