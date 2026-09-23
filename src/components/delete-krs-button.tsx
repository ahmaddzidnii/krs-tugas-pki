import { FaTrash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useAlertDialog } from "@/hooks/use-alert-dialog";
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog";
import { getPesanBerhasilHapusKrs, getPesanKonfirmasiHapusKRS } from "@/lib/message-modal-helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface DeleteKrsButtonProps {
  id_kelas: string;
  nama_mata_kuliah: string;
  nama_kelas: string;
  onDeleted?: () => void;
}

export const DeleteKrsButton = ({ id_kelas, nama_mata_kuliah, nama_kelas, onDeleted }: DeleteKrsButtonProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { confirm } = useConfirmationDialog();
  const { showAlert } = useAlertDialog();

  const hapusMutation = useMutation(
    trpc.krs.hapusKelas.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.krs.getInformasiUmum.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.krs.getDataKelasYangDiambil.queryKey(),
        });

        if (onDeleted) {
          onDeleted();
        } else {
          queryClient.invalidateQueries({
            queryKey: trpc.krs.getPenawaranKelas.queryKey(),
          });
        }

        showAlert({
          variant: "success",
          message: getPesanBerhasilHapusKrs(nama_mata_kuliah, nama_kelas),
        });
      },
      onError: (error) => {
        showAlert({
          variant: "error",
          message: error.message,
        });
      },
    }),
  );

  const handleDelete = async () => {
    const ok = await confirm({
      message: getPesanKonfirmasiHapusKRS(nama_mata_kuliah, nama_kelas),
      confirmText: "Ya",
      cancelText: "Batal",
      type: "warning",
      async onConfirm() {
        await hapusMutation.mutateAsync({ id_kelas });
      },
    });

    if (!ok) return;
  };

  return (
    <Button
      variant="destructive"
      className="[&_svg]:size-5"
      disabled={hapusMutation.isPending}
      onClick={handleDelete}
    >
      <FaTrash />
    </Button>
  );
};
