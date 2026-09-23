"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface AlertOptions {
  title?: string;
  message: React.ReactNode;
  keterangan?: string;
  variant?: "success" | "error";
}

interface AlertDialogContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

// Helper untuk memecah teks & membungkus konten dalam kurung kurawal {} ke dalam <strong>
function wrapBracesSplit(content?: React.ReactNode): React.ReactNode {
  if (typeof content !== "string") {
    return content;
  }

  return content.split(/({[^}]+})/).map((chunk, i) => {
    const m = chunk.match(/^{([^}]+)}$/);
    return m ? (
      <strong
        key={i}
        className="font-semibold text-foreground"
      >
        {m[1].trim()}
      </strong>
    ) : (
      chunk
    );
  });
}

export const AlertDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: "",
    message: "",
    variant: "success",
    keterangan: "",
  });

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen]);

  const showAlert = (alertOptions: AlertOptions) => {
    setOptions({
      variant: "success",
      ...alertOptions,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="alert-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
          >
            <motion.div
              key="alert-box"
              className={cn(
                "bg-white rounded-[5px] p-5 max-w-xl w-full shadow-xl border-t-6",
                options.variant === "success" ? "border-green-400" : "border-red-400",
              )}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="mb-2 text-2xl text-muted-foreground">{options.title || "Pemberitahuan"}</h3>

                {/* message sekarang diparsing menggunakan wrapBracesSplit */}
                <div className="text-muted-foreground text-sm">{options.message ? wrapBracesSplit(options.message) : "Kelas berhasil diambil"}</div>
              </div>

              {options.variant === "error" && options.keterangan && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <span>
                    <strong>Keterangan :</strong>
                  </span>
                  <p className="mt-1 text-xs italic">{wrapBracesSplit(options.keterangan)}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="uppercase"
                >
                  OK
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertDialogContext.Provider>
  );
};

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error("useAlertDialog must be used within an AlertDialogProvider");
  return context;
};
