import { createContext } from 'react';

export const WishlistContext = createContext({
  items: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  clearWishlist: () => {},
});
