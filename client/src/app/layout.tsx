"use client";

import "./globals.css";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/Navbar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { cn } from "@/lib/utils";
import { FcGoogle } from "react-icons/fc";
import { GoogleOAuthProvider, useGoogleLogin, googleLogout, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import api from "@/config/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";
import { LoaderX } from "@/components/LoaderX";
import Link from "next/link";

interface UserData {
  name?: string;
  email?: string;
  picture?: string;
  googleAccessToken?: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const pathname = usePathname();

  // Check if current route is a notes page
  const isNotesPage = pathname?.startsWith('/notes/');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    const googleToken = localStorage.getItem("googleAccessToken");
    
    if (token && userData) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // If we have a stored Google token, verify it's still valid
      if (googleToken) {
        verifyTokenValidity(googleToken).catch(() => {
          // Token might be expired, clear it
          localStorage.removeItem("googleAccessToken");
        });
      }
    }
  }, []);

  const verifyTokenValidity = async (token: string) => {
    try {
      await axios.get(
        "https://www.googleapis.com/oauth2/v3/tokeninfo",
        { params: { access_token: token } }
      );
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    setLoading(true);

    localStorage.clear();
    
    // Clear Google OAuth session
    googleLogout();
    
    setIsLoggedIn(false);
    setUser(null);
    setLoading(false);
    
    // Redirect to home page
    window.location.href = "/";
  };

  const handleLoginSuccess = async (googleAccessToken: string, userInfo: any, backendResponse?: any) => {
    try {
      setAuthLoading(true);
      
      console.log("Login success handler called with:", { 
        googleAccessToken, 
        userInfo,
        backendResponse 
      });
      
      // Determine which data to use
      let finalUserData;
      let sessionToken;
      let finalGoogleToken = googleAccessToken;
      
      if (backendResponse?.success) {
        // Use backend response data
        sessionToken = backendResponse.data.token;
        finalGoogleToken = backendResponse.data.googleAccessToken || googleAccessToken;
        finalUserData = {
          ...userInfo,
          ...backendResponse.data.user
        };
      } else {
        // Fallback: Create minimal user data from Google
        sessionToken = `temp_${Date.now()}`; // Temporary token
        finalUserData = userInfo;
      }
      
      // Store tokens and user data
      localStorage.setItem("authToken", backendResponse.data.token);
      localStorage.setItem("user", JSON.stringify(finalUserData));
      localStorage.setItem("googleAccessToken", finalGoogleToken);
      localStorage.setItem("expiresIn",backendResponse.data.expiresIn);

      
      setIsLoggedIn(true);
      setUser({
        ...finalUserData,
        googleAccessToken: finalGoogleToken
      });
      
      setAuthLoading(false);
      
      // Redirect to home page
      window.location.href = "/";
      
    } catch (error: any) {
      console.error("Login success handler error:", error);
      setAuthLoading(false);
      alert("Failed to complete login. Please try again.");
    }
  };

  if (!mounted)
    return (
      <html lang="en" className="scroll-smooth bg-black">
        <body>
          <LoaderX />
        </body>
      </html>
    );

  return (
    <GoogleOAuthProvider 
      clientId={`${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}`}
      onScriptLoadError={() => console.error("Google OAuth script failed to load")}
    >
      <html lang="en" className="scroll-smooth bg-black text-white">
        <head>
          <title>PaperTube</title>
          <meta name="description" content="Learn, Grow, and Earn with PaperTube." />
          <link rel="icon" type="image/x-icon" href="/papertube.ico" />
        </head>
        <body>
          <div className="fixed inset-0 -z-10 opacity-25 pointer-events-none">
            <BackgroundBeams />
          </div>

          {/* One-tap sign-in */}
          <GoogleOneTapLoginWrapper 
            onSuccess={handleLoginSuccess}
            onError={() => console.error("Google one-tap login failed")}
          />

          {/* Conditionally render navbar based on route */}
          {!isNotesPage && (
            <>
              <Navbar className="z-50">
                <NavBody>
                  <NavbarLogo />
                  <NavItems
                    items={[
                      // { name: "Home", link: "/" },
                      // { name: "Features", link: "/features" },
                      // { name: "Pricing", link: "/pricing" },
                      // { name: "About", link: "/about" },
                    ]}
                  />
                  {authLoading ? (
                    <div className="px-4 py-2">
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    </div>
                  ) : isLoggedIn ? (
                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={loading}>
                          <button className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:opacity-50">
                            <Avatar className="h-8 w-8 border border-neutral-600">
                              <AvatarImage src={user?.picture} alt={user?.name || "User"} />
                              <AvatarFallback className="bg-neutral-700 text-neutral-300 text-xs">
                                {user?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-64 bg-neutral-900 border-neutral-700 text-white"
                        >
                          <div className="flex items-center gap-2 p-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.picture} alt={user?.name} />
                              <AvatarFallback className="bg-neutral-700 text-neutral-300">
                                {user?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium">{user?.name}</p>
                              <p className="text-xs text-neutral-400">{user?.email}</p>
                            </div>
                          </div>
                          
                          <DropdownMenuSeparator className="bg-neutral-700" />
                          
                          <DropdownMenuItem 
                            className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer focus:bg-neutral-800"
                            onClick={() => window.location.href = "/profile"}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer focus:bg-neutral-800"
                            onClick={() => window.location.href = "/profile?tab=settings"}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator className="bg-neutral-700" />
                          
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-400 hover:bg-red-950 hover:text-red-300 cursor-pointer focus:bg-red-950 focus:text-red-300"
                            onClick={handleLogout}
                            disabled={loading}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>{loading ? "Logging out..." : "Logout"}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="z-50 relative">
                      <GoogleLoginBtn
                        onSuccess={handleLoginSuccess}
                        loading={authLoading}
                      />
                    </div>
                  )}
                </NavBody>
              </Navbar>

              <MobileNav className="z-50 relative">
                <MobileNavHeader>
                  <NavbarLogo />
                  <MobileNavToggle
                    isOpen={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                    disabled={authLoading}
                  />
                </MobileNavHeader>
                <MobileNavMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
                  <div className="flex flex-col space-y-4 w-full p-4">
                    {[
                      { name: "Home", link: "/" },
                      { name: "Features", link: "/features" },
                      { name: "Pricing", link: "/pricing" },
                      { name: "About", link: "/about" },
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href={item.link}
                        className="px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-md transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}

                    {authLoading ? (
                      <div className="flex justify-center p-4">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                      </div>
                    ) : isLoggedIn ? (
                      <>
                        <div className="flex items-center gap-3 p-3 border-b border-neutral-800">
                          <Avatar className="h-10 w-10 border border-neutral-600">
                            <AvatarImage src={user?.picture} alt={user?.name} />
                            <AvatarFallback className="bg-neutral-700 text-neutral-300">
                              {user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-white">{user?.name}</p>
                            <p className="text-xs text-neutral-400">{user?.email}</p>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-md transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>

                        <NavbarButton
                          href="/dashboard"
                          className="w-full text-center mt-2"
                          onClick={() => setMenuOpen(false)}
                        >
                          Dashboard
                        </NavbarButton>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                          disabled={loading}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-400 bg-red-950 rounded-lg hover:bg-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LogOut className="h-4 w-4" />
                          {loading ? "Logging out..." : "Logout"}
                        </button>
                      </>
                    ) : (
                      <GoogleLoginBtn
                        className="w-full justify-center mt-4"
                        onSuccess={handleLoginSuccess}
                        loading={authLoading}
                      />
                    )}
                  </div>
                </MobileNavMenu>
              </MobileNav>
            </>
          )}

          <main className="flex-1 z-10 relative">{children}</main>
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}

// Google One-Tap Login Component
function GoogleOneTapLoginWrapper({ 
  onSuccess, 
  onError 
}: { 
  onSuccess: (token: string, userInfo: any, backendResponse?: any) => void;
  onError: (error: any) => void;
}) {
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        console.log("One-tap login credential:", credentialResponse);
        
        // credentialResponse.credential is an ID token
        const idToken = credentialResponse.credential;
        
        // Get user info from ID token
        const { data: userInfo } = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );
        
        console.log("One-tap user info:", userInfo);
        
        // Send to backend
        try {
          const response = await axios.post("/api/auth/google", {
            googleAccessToken: idToken,
            authType: 'id_token'
          });
          
          console.log("One-tap backend response:", response.data);
          
          if (response.data.success) {
            onSuccess(idToken, {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            }, response.data);
          } else {
            onSuccess(idToken, {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            });
          }
        } catch (backendError: any) {
          console.error("Backend error in one-tap:", backendError);
          // Still allow login with Google data even if backend fails
          onSuccess(idToken, {
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture
          });
        }
      } catch (error) {
        console.error("One-tap login error:", error);
        onError(error);
      }
    },
    onError: (error) => {
      console.error("Google One Tap login failed:", error);
      onError(error);
    },
    disabled: false,
    cancel_on_tap_outside: false,
  });

  return null;
}

// Updated Google Login Button Component
function GoogleLoginBtn({
  className = "",
  onSuccess,
  loading = false,
}: {
  className?: string;
  onSuccess: (googleAccessToken: string, userInfo: any, backendResponse?: any) => void;
  loading?: boolean;
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google OAuth response:", tokenResponse);
        const accessToken = tokenResponse.access_token;

        // Get user info from Google using access token
        const { data: userInfo } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { 
            headers: { 
              Authorization: `Bearer ${accessToken}` 
            } 
          }
        );

        console.log("User info from Google:", userInfo);

        // Send to backend
        try {
          const response = await api.post("/auth/google", {
            googleAccessToken: accessToken,
            authType: 'access_token'
          });

          console.log("Backend response:", response.data);

          if (response.data.success) {
            // Call the success handler with backend data
            onSuccess(accessToken, {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture,
              ...response.data.data.user
            }, response.data);
          } else {
            // If backend returns success: false but has data, still proceed
            if (response.data.data) {
              onSuccess(accessToken, {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                ...response.data.data.user
              }, response.data);
            } else {
              throw new Error(response.data.message || "Login failed");
            }
          }
        } catch (backendError: any) {
          console.error("Backend API error:", backendError);
          
          // Check if it's a network error or server error
          if (!backendError.response) {
            // Network error - try direct login
            console.log("Network error, using direct login");
            onSuccess(accessToken, {
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture
            });
          } else {
            // Server responded with error
            console.error("Backend error response:", backendError.response.data);
            
            // Try to parse error message
            const errorMsg = backendError.response.data?.message || 
                           backendError.response.data?.error || 
                           "Backend authentication failed";
            
            // Still allow login with Google data
            if (backendError.response.status !== 401) {
              onSuccess(accessToken, {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
              });
            } else {
              alert(`${errorMsg}. Please try again.`);
            }
          }
        }
      } catch (err: any) {
        console.error("Google login error details:", err);
        
        // More detailed error logging
        if (err.response) {
          console.error("Response error:", err.response.data);
          console.error("Response status:", err.response.status);
        }
        
        // User-friendly error message
        let errorMessage = "Login failed. Please try again.";
        
        if (err.message.includes("Network Error")) {
          errorMessage = "Cannot connect to server. Please check your internet connection.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Request timeout. Please try again.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please check your credentials.";
        } else if (err.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
        
        alert(errorMessage);
      }
    },
    onError: (err) => {
      console.error("Google OAuth error:", err);
      alert("Google authentication failed. Please try again.");
    },
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file',
    flow: 'implicit',
  });

  return (
    <button
      onClick={() => login()}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-black rounded-full shadow-md hover:shadow-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-gray-600 animate-spin"></div>
          Processing...
        </>
      ) : (
        <>
          <FcGoogle className="text-lg" />
          Continue with Google
        </>
      )}
    </button>
  );
}