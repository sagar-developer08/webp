"use client";

import { useRouter } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../components/navbar';
import Footer from '../../../components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faUser, faLocationDot, faCreditCard, faCheck, faTimes, faBox } from '@fortawesome/free-solid-svg-icons';
import PageBanner from "../../../components/page-banner";

const OrdersPage = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use real order data from user profile
  useEffect(() => {
    if (user && user.orderHistory) {
      // Map the orderHistory array from the user profile to our orders format
      const mappedOrders = user.orderHistory.map(order => ({
        _id: order._id,
        createdAt: order.createdAt,
        total: order.totalPrice,
        status: order.status,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        items: order.orderItems.map(item => ({
          _id: item._id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          productId: item.product
        }))
      }));

      // Sort orders by date (newest first)
      const sortedOrders = mappedOrders.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setOrders(sortedOrders);
      setIsLoading(false);
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Update handleProductClick to accept productId parameter
  const handleProductClick = (productId) => {
    router.push(`/products-details?productId=${productId}`);
  };

  return (
    <div className="min-h-screen bg-white text-white">
      <Navbar
        logoSrc="/logo.webp"
        search="/search.svg"
        account="/account.svg"
        sVG="/svg2.svg"
        navbarBackgroundColor={"transparent"}
      />
      <PageBanner title="Order" breadcrumb="Home > Order" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.back()}
            className="text-center flex items-center rounded-[100px] gap-2 py-2 px-4 bg-[#000] border border-solid-[1px] border-white text-white hover:bg-[#fff] hover:text-[#000] transition-colors hover:border-[#000] "
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold">Order History</h1>
          <div className="w-20"></div>
        </motion.div>

        <AnimatePresence>
          {orders && orders.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="space-y-6"
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg overflow-hidden shadow-xl border border-gray-700"
                >
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                      <div>
                        <p className="text-sm text-black">Order placed</p>
                        <p className="text-black font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-sm text-black">Total</p>
                        <p className="text-black font-medium text-xl">AED {order.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <p className="text-sm text-black">Order #{order._id}</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-800 text-white border border-green-600' :
                          order.status === 'processing' ? 'bg-blue-800 text-white border border-blue-600' :
                            order.status === 'shipped' ? 'bg-purple-800 text-white border border-purple-600' :
                              order.status === 'pending' ? 'bg-yellow-800 text-white border border-yellow-600' :
                                'bg-gray-700 text-white border border-gray-600'
                          }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Show shipping address */}
                    {order.shippingAddress && (
                      <div className="mb-4 p-3 bg-[#2a2a2a] rounded-md border border-gray-700">
                        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                          <FontAwesomeIcon icon={faLocationDot} className="text-black" />
                          Shipping Address
                        </h4>
                        <p className="text-sm">{order.shippingAddress.address}</p>
                        <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p className="text-sm">{order.shippingAddress.country}</p>
                      </div>
                    )}

                    {/* Show payment method */}
                    <div className="mb-4 flex justify-between items-center bg-[#2a2a2a] p-3 rounded-md border border-gray-700">
                      <div>
                        <span className="text-sm text-white flex items-center gap-2">
                          <FontAwesomeIcon icon={faCreditCard} className="text-gray-400" />
                          Payment Method:
                        </span>
                        <span className="text-sm">{order.paymentMethod}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${order.isPaid ? 'bg-green-800 text-white' : 'bg-red-800 text-white'
                          }`}>
                          {order.isPaid ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
                          {order.isPaid ? 'Paid' : 'Not Paid'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 my-3"></div>

                    {/* Order items */}
                    <h4 className="text-sm font-medium text-black mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCartShopping} className="text-black" />
                      Order Items
                    </h4>
                    {order.items.map((item) => (
                      <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-4 border-b border-gray-700 last:border-0">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#2a2a2a] border border-gray-700">
                          <Image
                            src={item.image && item.image.trim() !== ''
                              ? (item.image.startsWith('http')
                                ? item.image
                                : item.image.startsWith('/')
                                  ? item.image
                                  : `/${item.image}`)
                              : "/no-image.webp"}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/no-image.webp";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-black">{item.name}</h4>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                            <p className="text-sm text-black">Quantity: <span className="text-black">{item.quantity}</span></p>
                            <p className="text-sm text-black">Price: <span className="text-black font-medium">AED {item.price.toLocaleString()}</span></p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <spam
                            onClick={() => handleProductClick(item.productId)}
                            className="inline-block px-4 py-2  bg-[#fff] hover:bg-[#000] hover:text-[#fff] border border-black border-solid-1px text-black rounded-[100px] transition-colors text-sm whitespace-nowrap cursor-pointer"
                          >
                            View Product
                          </spam>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a] p-10 rounded-lg text-center shadow-xl border border-gray-700"
            >
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
              <p className="text-gray-400 mb-6">You haven't placed any orders yet. Browse our collection and find your perfect timepiece.</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-3 bg-[#3a3a3a] text-white rounded-lg hover:bg-[#4a4a4a] transition-colors font-medium border border-gray-700"
                >
                  Start Shopping
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer
        maskGroup="/logo.webp"
        iconYoutube="/icon--youtube.svg"
        itemImg="/icon--facebook.svg"
        itemImg1="/icon--instagram.svg"
        itemImg2="/icon--linkedin.svg"
      />
    </div>
  );
};

export default OrdersPage;
