import React from 'react';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export default function Footer() {
  return (
    <footer className="relative w-full bg-black border-t  border-gray-800">
      <BackgroundBeamsWithCollision className="py-8 md:py-12">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand Section - Full width on mobile, then spans 2 columns */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg 
                    className="w-4 h-4 sm:w-6 sm:h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Paper<span className="text-red-600">Tube</span>
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    YouTube to Smart Notes Converter
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm sm:text-base max-w-md">
                Transform YouTube videos into beautifully formatted PDF notes using 
                advanced AI. Never miss important insights from your favorite content.
              </p>
            </div>

            {/* Links Container - Two columns on mobile, four on desktop */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:col-span-2">
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Quick Links</h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li>
                    <a href="/features" className="text-gray-400 hover:text-red-500 transition-colors text-sm sm:text-base block py-1">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-gray-400 hover:text-red-500 transition-colors text-sm sm:text-base block py-1">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="text-gray-400 hover:text-red-500 transition-colors text-sm sm:text-base block py-1">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Products</h3>
                <ul className="space-y-2 sm:space-y-3">
                 
                  <li>
                    <a href="https://www.heartecho.in" className="text-white font-bold text-decoration-none hover:text-red-500 transition-colors text-sm sm:text-base block py-1">
                     <img src="/heartechor.png" alt="HeartEcho" className="inline-block h-5 mr-1" />
                      HeartEcho
                    </a>
                  </li>
                 
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section - Stack on mobile, row on larger screens */}
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} PaperTube. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </footer>
  );
}