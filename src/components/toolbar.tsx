import { MessageSquareTextIcon, Pencil, SmileIcon, Trash } from "lucide-react";
import { Button } from "./ui/button";
import Hint from "./hint";
import EmojiPopover from "./emoji-popover";

interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton?: boolean;
}

const Toolbar = ({
  isAuthor,
  isPending,
  handleEdit,
  handleDelete,
  handleReaction,
  handleThread,
  hideThreadButton,
}: ToolbarProps) => {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <Hint label="Reagir">
          <EmojiPopover
            hint="Adicionar reação"
            onEmojiSelect={(emoji) => handleReaction(emoji.native)}
          >
            <Button variant={"ghost"} size={"iconSm"} disabled={isPending}>
              <SmileIcon className="size-4" />
            </Button>
          </EmojiPopover>
        </Hint>

        {!hideThreadButton && (
          <Hint label="Ver thread">
            <Button variant={"ghost"} size={"iconSm"} disabled={isPending} onClick={handleThread}>
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Editar mensagem">
            <Button variant={"ghost"} size={"iconSm"} disabled={isPending} onClick={handleEdit}>
              <Pencil className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Deletar Mensagem">
            <Button variant={"ghost"} size={"iconSm"} disabled={isPending} onClick={handleDelete}>
              <Trash className="size-4 text-rose-600" />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
