"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackDbActivity } from "@/utils/analytics";

const UserTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    trackDbActivity(pathname);
  }, [pathname]);

  return null;
};

export default UserTracker;