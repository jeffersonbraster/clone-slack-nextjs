import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import UseConfirm from "@/hooks/use-confirm";

interface PreferencesModelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValues: string;
}

const PreferencesModel = ({
  open,
  setOpen,
  initialValues,
}: PreferencesModelProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = UseConfirm(
    "Você tem certeza?",
    "Essa ação não pode ser desfeita."
  );

  const [value, setValue] = useState(initialValues);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateWorkspace, isPending: isUpdateWorkspaceLoading } =
    useUpdateWorkspace();
  const { mutate: removeWorkspace, isPending: isRemoveWorkspaceLoading } =
    useRemoveWorkspace();

  const handlerEditWorkspace = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateWorkspace(
      { id: workspaceId, name: value },
      {
        onSuccess: () => {
          toast.success("Workspace atualizado com sucesso");
          setEditOpen(false);
        },
        onError: () => {
          toast.error(
            "Erro ao atualizar workspace, tente novamente mais tarde."
          );
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success("Workspace removido com sucesso");
          router.replace("/");
        },
        onError: () => {
          toast.error("Erro ao remover workspace, tente novamente mais tarde.");
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Nome do workspace</p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                      Editar
                    </p>
                  </div>
                  <p className="text-sm">{value}</p>
                </div>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renomear Workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handlerEditWorkspace}>
                  <Input
                    value={value}
                    disabled={isUpdateWorkspaceLoading}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={50}
                    placeholder="Meu lindo workspace"
                  />

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant={"outline"}
                        disabled={isUpdateWorkspaceLoading}
                      >
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdateWorkspaceLoading}>Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={isRemoveWorkspaceLoading}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Deletar workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreferencesModel;
