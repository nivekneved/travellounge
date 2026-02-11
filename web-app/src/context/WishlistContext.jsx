import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) setWishlist(JSON.parse(saved));
    }, []);

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const isExist = prev.find(item => item._id === product._id);
            let updated;
            if (isExist) {
                updated = prev.filter(item => item._id !== product._id);
            } else {
                updated = [...prev, product];
            }
            localStorage.setItem('wishlist', JSON.stringify(updated));
            return updated;
        });
    };

    const isInWishlist = (id) => wishlist.some(item => item._id === id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
