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
import { FcGoogle } from "react-icons/fc";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
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
import { LogOut, User, Coins, Plus } from "lucide-react";
import { LoaderThree } from "@/components/ui/loader";
import { LoaderX } from "@/components/LoaderX";

interface UserData {
  name?: string;
  email?: string;
  picture?: string;
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
  const [tokenCount, setTokenCount] = useState<number>(0);
  const pathname = usePathname();

  // Check if current route is a notes page
  const isNotesPage = pathname?.startsWith('/notes/');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      fetchTokenCount(token);
    }
  }, []);

  const fetchTokenCount = async (authToken: string) => {
    try {
      const response = await api.get("/auth/getToken", {
        headers: {
          'Auth': authToken
        }
      });
      
      if (response.data.success) {
        setTokenCount(response.data.token);
      }
    } catch (error) {
      console.error("❌ Error fetching token count:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setTokenCount(0);
  };

  const handleTokenClick = () => {
    window.location.href = "/profile";
  };

  const handleAddTokens = () => {
    window.location.href = "/profile?tab=tokens";
  };

  if (!mounted)
    return (
      <html lang="en" className="scroll-smooth bg-black">
        <body>
               <LoaderX/>
        </body>
      </html>
    );

  return (
    <GoogleOAuthProvider clientId="282412601110-562uee31vll96ict5q9bg0elt7p4ilbb.apps.googleusercontent.com">
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

          {/* Conditionally render navbar based on route */}
          {!isNotesPage && (
            <>
              <Navbar className="z-50">
                <NavBody>
                  <NavbarLogo />
                  <NavItems
                    items={[
                      { name: "Home", link: "/" },
                      { name: "Features", link: "/features" },
                      { name: "Docs/API", link: "/contact" },
                      { name: "Community", link: "/community" },
                    ]}
                  />
                  {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-neutral-800 rounded-full px-3 py-1 border border-neutral-600">
                        <button
                          onClick={handleTokenClick}
                          className="flex items-center gap-1 hover:bg-neutral-700 rounded-full px-2 py-1 transition-colors cursor-pointer"
                        >
                          <Coins className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-medium">{tokenCount}</span>
                        </button>
                        
                        <button
                          onClick={handleAddTokens}
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 hover:bg-green-500 transition-colors cursor-pointer"
                          title="Add Tokens"
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </button>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-600">
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
                          className="w-56 bg-neutral-900 border-neutral-700 text-white"
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
                          
                          <div className="px-2 py-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-400">Tokens:</span>
                              <span className="flex items-center gap-1 font-medium">
                                <Coins className="h-3 w-3 text-yellow-400" />
                                {tokenCount}
                              </span>
                            </div>
                          </div>
                          
                          <DropdownMenuSeparator className="bg-neutral-700" />
                          <DropdownMenuItem 
                            className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer focus:bg-neutral-800"
                            onClick={handleTokenClick}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-neutral-700" />
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-400 hover:bg-red-950 hover:text-red-300 cursor-pointer focus:bg-red-950 focus:text-red-300"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="z-50 relative">
                      <GoogleLoginBtn
                        onSuccess={(userData, token) => {
                          setUser(userData);
                          setIsLoggedIn(true);
                          localStorage.setItem("authToken", token);
                          localStorage.setItem("user", JSON.stringify(userData));
                          fetchTokenCount(token);
                        }}
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
                  />
                </MobileNavHeader>
                <MobileNavMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
                  <div className="flex flex-col space-y-4 w-full p-4">
                    {[
                      { name: "Home", link: "/" },
                      { name: "Features", link: "/features" },
                      { name: "Docs/API", link: "/contact" },
                      { name: "Community", link: "/community" },
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

                    {isLoggedIn ? (
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

                        <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-yellow-400" />
                            <span className="text-sm font-medium">Tokens</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{tokenCount}</span>
                            <button
                              onClick={() => {
                                handleAddTokens();
                                setMenuOpen(false);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-500 transition-colors cursor-pointer"
                            >
                              <Plus className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        </div>

                        <a
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-md transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </a>

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
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-400 bg-red-950 rounded-lg hover:bg-red-900 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <GoogleLoginBtn
                        className="w-full justify-center mt-4"
                        onSuccess={(userData, token) => {
                          setUser(userData);
                          setIsLoggedIn(true);
                          localStorage.setItem("authToken", token);
                          localStorage.setItem("user", JSON.stringify(userData));
                          setMenuOpen(false);
                          fetchTokenCount(token);
                        }}
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

function GoogleLoginBtn({
  className = "",
  onSuccess,
}: {
  className?: string;
  onSuccess: (userData: UserData, token: string) => void;
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const response = await api.post("/auth/google", {
          name: data.name,
          email: data.email,
          picture: data.picture,
        });

        const sessionToken = response.data.sessionToken;

        localStorage.setItem("authToken", sessionToken);
        localStorage.setItem("user", JSON.stringify(data));

        onSuccess(data, sessionToken);

        window.location.href = "/";
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (err) => console.error("Login Failed:", err),
  });

  return (
    <button
      onClick={() => login()}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-black rounded-full shadow-md hover:shadow-lg hover:bg-gray-100 transition cursor-pointer ${className}`}
    >
      <FcGoogle className="text-lg" />
      Continue with Google
    </button>
  );
}