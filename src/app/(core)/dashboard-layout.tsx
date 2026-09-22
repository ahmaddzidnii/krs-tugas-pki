"use client";

import { FaListCheck } from "react-icons/fa6";
import { useState, useEffect, useLayoutEffect } from "react";
import { FaClipboard, FaHome, FaSignOutAlt } from "react-icons/fa";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { RiCloseLine } from "react-icons/ri";
import { PiListBold } from "react-icons/pi";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { IconType } from "react-icons";
import { type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface SidebarButtonProps {
  onClick?: () => void;
  isActive: boolean;
  icon: LucideIcon | IconType;
  label: string;
}

export const SidebarButton = ({ icon, isActive, label, onClick }: SidebarButtonProps) => {
  const IconComponent = icon;
  return (
    <div className={cn("border-l-4 border-l-transparent w-full", isActive && "border-l-[#105E15] text-[#105E15]")}>
      <button
        onClick={onClick}
        className="flex h-12 items-center px-5 cursor-pointer w-full"
      >
        <IconComponent className={cn("size-4 mr-2", isActive && "fill-[#105E15]")} />
        <span className="text-sm w-full text-start">{label}</span>
      </button>
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function getInisials(name: string): string {
  const words = name.trim().split(/\s+/); // pisahkan berdasarkan spasi
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() || "");
  return initials.join("");
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useLayoutEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1181; // lg breakpoint
      setIsMobile(mobile);

      // Auto close sidebar on mobile when switching from desktop
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();
    setIsInitialized(true);

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isInitialized) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById("sidebar");
        const menuButton = document.getElementById("menu-button");

        if (sidebar && !sidebar.contains(event.target as Node) && menuButton && !menuButton.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isSidebarOpen, isInitialized]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && isInitialized) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile, isInitialized]);

  // Disable body scroll when sidebar open
  useEffect(() => {
    if (!isInitialized) return;

    if (isSidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, isMobile, isInitialized]);

  const { isLoading, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="bg-white h-16 shadow flex items-center justify-between px-3  py-2.5 fixed top-0 left-0 right-0 z-[9999999]">
        <Logo className="h-24 aspect-video" />
        <span className="font-semibold text-lg uppercase text-[#9E927B] hidden md:block">Kartu Rencana Studi</span>
        <div className="lg:hidden">
          <Button
            className="rounded-full! aspect-square p-0 size-10"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <RiCloseLine /> : <PiListBold />}
          </Button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto w-full flex pt-20 min-h-screen rounded-2xl relative">
        <aside
          id="sidebar"
          className={`
            bg-white shadow shrink-0 rounded-none z-50 pt-16 lg:pt-0
            ${isMobile ? "fixed left-0 top-0 bottom-0 w-full h-full" : "w-72 static rounded-l-xl"}
            ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="relative h-[52px] flex items-center pl-5">
            <span className="font-bold">Navigasi</span>
          </div>

          <div className="p-4">
            <div className="border flex items-center justify-center flex-col p-5 rounded-[5px]">
              <span className="text-[100px] font-bold text-[#105E15]">{getInisials(user?.nama ?? "PTIPD")}</span>
              <div className="text-center">
                <p className="font-semibold uppercase text-[#777777]">{user?.nama ?? "PTIPD"}</p>
                <p className="text-[#777777] text-[13px]">{user?.username ?? "001"}</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="mt-5 text-[#777777] text-sm">
            <SidebarButton
              icon={FaHome}
              isActive={pathname === "/dash"}
              label="Dashboard"
              onClick={() => {
                router.push("/dash");
              }}
            />
            <SidebarButton
              icon={FaListCheck}
              isActive={pathname.startsWith("/krs/pengisian")}
              label="Isi KRS"
              onClick={() => {
                router.push("/krs/pengisian");
              }}
            />
            <SidebarButton
              icon={FaClipboard}
              isActive={pathname.startsWith("/krs/lihat")}
              label="Lihat KRS"
              onClick={() => {
                router.push("/krs/lihat");
              }}
            />
            <SidebarButton
              icon={FaSignOutAlt}
              isActive={false}
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </aside>

        {/* Mobile menu button - floating button when sidebar is closed */}

        <main className={`flex-1 flex flex-col ${isMobile ? "w-full" : ""}`}>{children}</main>
      </div>

      <footer className="shadow w-full p-4 flex items-center justify-center mt-5 bg-white">
        <p className="text-muted-foreground text-xs">
          Copyright © {new Date().getFullYear()} <span className="font-bold">PTIPD - UIN Sunan Kalijaga.</span> All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default DashboardLayout;
