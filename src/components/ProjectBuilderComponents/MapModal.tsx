
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Search, Star } from 'lucide-react';
import { Store, UserLocation } from '../maps-service';
import { getMapsService } from '../maps-service';
import { CartItem, Product } from '../products-service';

interface MapModalProps {
  showMapModal: boolean;
  setShowMapModal: (show: boolean) => void;
  placeSearchQuery: string;
  setPlaceSearchQuery: (query: string) => void;
  handlePlaceSearch: () => Promise<void>;
  isSearchingPlaces: boolean;
  cart: CartItem[];
  products: Product[];
  placeSearchResults: Store[];
  nearbyStores: Store[];
  autoSearchTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

const MapModal: React.FC<MapModalProps> = ({
  showMapModal,
  setShowMapModal,
  placeSearchQuery,
  setPlaceSearchQuery,
  handlePlaceSearch,
  isSearchingPlaces,
  cart,
  products,
  placeSearchResults,
  nearbyStores,
  autoSearchTimeout,
}) => {
  return (
    showMapModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[85vh] mx-4 overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-blue-500" size={28} />
              Find Stores & Products
            </h2>
            <button
              onClick={() => setShowMapModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Enhanced Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for products, stores, or locations..."
                  value={placeSearchQuery}
                  onChange={(e) => {
                    setPlaceSearchQuery(e.target.value);
                    // Auto-search after user stops typing for 500ms
                    if (autoSearchTimeout.current) {
                      clearTimeout(autoSearchTimeout.current);
                    }
                    autoSearchTimeout.current = setTimeout(() => {
                      if (e.target.value.trim()) {
                        handlePlaceSearch();
                      }
                    }, 500);
                  }}
                  className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={handlePlaceSearch}
                disabled={isSearchingPlaces}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSearchingPlaces ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Quick Search Suggestions */}
            {cart.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quick search:</span>
                {cart.slice(0, 3).map(cartItem => {
                  const product = products.find(p => p.id === cartItem.productId);
                  return product ? (
                    <button
                      key={product.id}
                      onClick={() => {
                        setPlaceSearchQuery(product.name);
                        handlePlaceSearch();
                      }}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {product.name}
                    </button>
                  ) : null;
                })}
                <button
                  onClick={() => {
                    setPlaceSearchQuery('electronics store');
                    handlePlaceSearch();
                  }}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  Electronics Stores
                </button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Map Section */}
            <div className="flex-1 relative">
              {isSearchingPlaces && (
                <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-300">Finding stores and products...</p>
                  </div>
                </div>
              )}

              {(placeSearchResults.length > 0 ? placeSearchResults : nearbyStores).length > 0 ? (
                <iframe
                  title="Nearby Stores Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY').getEmbedMapUrl(placeSearchResults.length > 0 ? placeSearchResults : nearbyStores)}
                  allowFullScreen
                  className="rounded-lg"
                />
              ) : !isSearchingPlaces ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-4 text-gray-400" size={64} />
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">No stores found</p>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Try searching for products or store types</p>
                    <button
                      onClick={() => {
                        setPlaceSearchQuery('electronics store');
                        handlePlaceSearch();
                      }}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Search Electronics Stores
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Results Sidebar */}
            {placeSearchResults.length > 0 && (
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" size={16} />
                    Search Results ({placeSearchResults.length})
                  </h3>
                  <div className="space-y-3">
                    {placeSearchResults.slice(0, 10).map((store, index) => (
                      <motion.div
                        key={store.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                            {store.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {store.distance.toFixed(1)} mi
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {store.address}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-400" size={12} />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {store.rating > 0 ? store.rating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const mapsService = getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY');
                              window.open(mapsService.getDirectionsUrl(store), '_blank');
                            }}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Directions
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  );
};

export default MapModal;
