import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCodeWorkspace } from "@/features/workspaces/api/use-new-join-code-workspace";
import UseConfirm from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}

const InviteModal = ({ open, setOpen, name, joinCode }: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = UseConfirm(
    "Tem certeza que deseja atualizar o código de convite? ",
    "Isso irá inativar o código atual e gerar um novo código de convite."
  );

  const { mutate, isPending } = useNewJoinCodeWorkspace();

  const handleNewCode = async () => {
    const ok = await confirm();

    if (!ok) return;

    mutate(
      { workspaceId },
      {
        onSuccess: () => {
          toast.success("Código atualizado");
        },
        onError: () => {
          toast.error("Erro ao atualizar código, tenta novamente mais tarde.");
        },
      }
    );
  };

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Link copiado"));
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar membros para {name}</DialogTitle>
            <DialogDescription>
              Use o código abaixo para convidar as pessoas para esse workspace
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest">{joinCode}</p>
            <Button onClick={handleCopy} variant={"ghost"} size={"sm"}>
              Copiar código
              <CopyIcon className="size-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              onClick={handleNewCode}
              variant={"outline"}
            >
              Novo código
              <RefreshCcw className="size-4 ml-2" />
            </Button>
            <DialogClose asChild>
              <Button>Fechar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteModal;
