"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import Navbar from '../../../components/navbar';
import Footer from '../../../components/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageBanner from "../../../components/page-banner";
import { faCartShopping, faUser, faLocationDot, faPlus, faEdit, faTrash, faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const AddressesPage = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [address, setAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  // Use real address data from user profile
  useEffect(() => {
    if (user && user.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar
        logoSrc="/logo.webp"
        search="/search.svg"
        account="/account.svg"
        sVG="/svg2.svg"
        navbarBackgroundColor={"transparent"}
      />
      <PageBanner title="Address" breadcrumb="Home > Address" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-10 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mb-8"
        >
          <button
            onClick={() => router.back()}
            className="text-center flex items-center rounded-[100px] gap-2 py-2 px-4 bg-[#000] border border-solid-[1px] border-white text-white hover:bg-[#fff] hover:text-[#000] transition-colors hover:border-[#000]"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            Back
          </button>
          {/* <h1 className="text-2xl sm:text-3xl text-black font-bold order-first sm:order-none">Addresses</h1> */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-[#000] border border-solid-[1px] border-white text-white rounded-[100px] hover:bg-[#5a5a5a] transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
            Add Address
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {addresses && addresses.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid gap-4 sm:gap-6"
            >
              {addresses.map((addr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a] p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faLocationDot} className="h-5 w-5 text-gray-400 shrink-0" />
                        <p className="font-medium text-base sm:text-lg break-words">{addr.address}</p>
                      </div>
                      <p className="text-gray-400 ml-7 text-sm sm:text-base">{addr.city}, {addr.postalCode}</p>
                      <p className="text-gray-400 ml-7 text-sm sm:text-base">{addr.country}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a] p-6 sm:p-10 rounded-lg text-center shadow-xl border border-gray-700"
            >
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Addresses Yet</h3>
              <p className="text-black mb-6">You haven't added any shipping addresses yet.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(true)}
                className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Your First Address
              </motion.button>
            </motion.div>
          )}

          {/* Add Address Form Modal */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-[#000] p-4 sm:p-6 rounded-lg w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Address</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-2 py-2 bg-[#000] border border-solid-[1px] border-white text-white rounded-md hover:bg-[#5a5a5a] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form className="space-y-4 bg-[#000]">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      className="w-full bg-[#000] border border-white border-solid-[1px] rounded-md py-2 text-white"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-[#000] border border-white border-solid-[1px] rounded-md py-2 text-white"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full bg-[#000] border border-white border-solid-[1px] rounded-md py-2 text-white"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                    <select
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full bg-[#000] border border-white border-solid-[1px] rounded-md py-2 text-white"
                    >
                      <option value="">Select Country</option>
                      <option value="UAE">UAE</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="w-full sm:w-auto px-4 py-2 bg-[#000] border border-solid-[1px] border-white text-white rounded-md hover:bg-[#5a5a5a] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-[#000] border border-solid-[1px] border-white text-white rounded-md hover:bg-[#4a4a4a] transition-colors border border-gray-700 flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                      Save Address
                    </button>
                  </div>
                </form>
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

export default AddressesPage;
