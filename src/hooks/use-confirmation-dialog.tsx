"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface ConfirmationOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm?: () => Promise<any>;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationDialogContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>({ message: "Apakah Anda yakin?" });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isOpen]);

  const confirm = (confirmOptions: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({
        title: "Konfirmasi",
        confirmText: "Ya",
        cancelText: "Batal",
        type: "info",
        ...confirmOptions,
      });
      setIsOpen(true);
      setResolver(() => resolve);
    });
  };

  const handleConfirm = async () => {
    if (!options.onConfirm) {
      resolver?.(true);
      closeModal();
      return;
    }

    setIsLoading(true);
    try {
      await options.onConfirm();
      resolver?.(true);
      closeModal();
    } catch (error) {
      console.error("Confirmation onConfirm failed:", error);
      resolver?.(false);
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resolver?.(false);
    closeModal();
  };

  const closeModal = () => {
    setIsOpen(false);
    setResolver(null);
    setIsLoading(false);
  };

  return (
    <ConfirmationDialogContext.Provider value={{ confirm }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="confirm-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleCancel}
          >
            <motion.div
              key="confirm-box"
              className="bg-white rounded-[5px] p-5 max-w-xl w-full shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="mb-2 text-2xl text-muted-foreground">{options.title ?? "Konfirmasi"}</h3>
                <div className="text-muted-foreground text-sm">{options.message}</div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleConfirm}
                  variant="default"
                  className="uppercase"
                  disabled={isLoading}
                >
                  {options.confirmText}
                </Button>
                <Button
                  onClick={handleCancel}
                  className="px-4 py-2 uppercase"
                  variant="secondary"
                  disabled={isLoading}
                >
                  {options.cancelText}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmationDialogContext.Provider>
  );
};

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationDialogContext);
  if (!context) throw new Error("useConfirmationDialog must be used within a ConfirmationDialogProvider");
  return context;
};
