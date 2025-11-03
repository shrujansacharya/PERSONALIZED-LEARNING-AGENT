
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, X, Search } from 'lucide-react';
import { Product, CartItem } from '../products-service';

interface StoreModalProps {
  showStoreModal: boolean;
  setShowStoreModal: (show: boolean) => void;
  storeSearchQuery: string;
  setStoreSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
  addToCart: (productId: string) => void;
  getCartTotal: () => number;
  handleCheckout: () => Promise<void>;
}

const StoreModal: React.FC<StoreModalProps> = ({
  showStoreModal,
  setShowStoreModal,
  storeSearchQuery,
  setStoreSearchQuery,
  getFilteredProducts,
  addToCart,
  getCartTotal,
  handleCheckout,
}) => {
  return (
    showStoreModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-7xl h-[90vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="text-purple-500" size={28} />
                Science Electronics Store
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Electronic components for your science projects
              </p>
            </div>
            <button
              onClick={() => setShowStoreModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search electronic components..."
                  value={storeSearchQuery}
                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredProducts().map(product => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
              >
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">${product.price}</p>
                <button 
                  onClick={() => addToCart(product.id)}
                  className="mt-2 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <span className="font-bold">Total: ${getCartTotal()}</span>
            <button
              onClick={handleCheckout}
              className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
              Checkout
            </button>
          </div>
        </motion.div>
      </div>
    )
  );
};

export default StoreModal;
