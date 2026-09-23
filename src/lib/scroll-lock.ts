let activeModalsCount = 0;
let unlockTimeout: NodeJS.Timeout | null = null;

export const lockScroll = () => {
    if (unlockTimeout) {
        clearTimeout(unlockTimeout);
        unlockTimeout = null;
    }
    if (activeModalsCount === 0) {
        document.body.style.overflow = "hidden";
    }
    activeModalsCount++;
};

export const unlockScroll = () => {
    activeModalsCount = Math.max(0, activeModalsCount - 1);
    if (activeModalsCount === 0) {
        // Beri jeda 100ms agar jika dialog berikutnya langsung buka,
        // scrollbar tidak sempat muncul dan meloncatkan layar
        unlockTimeout = setTimeout(() => {
            if (activeModalsCount === 0) {
                document.body.style.overflow = "";
            }
        }, 100);
    }
};