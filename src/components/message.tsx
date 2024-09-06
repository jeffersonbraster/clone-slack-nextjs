import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Thumbnail from "./thumbnail";
import Toolbar from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-messages";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDeleteMessage } from "@/features/messages/api/use-remove-messages";
import UseConfirm from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import Reactions from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import ThreadBar from "./thread-bar";

const Renderer = dynamic(() => import("./renderer"), { ssr: false });
const Editor = dynamic(() => import("./editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Hoje" : isYesterday(date) ? "Ontem" : format(date, "dd/MM/yyyy")} às ${format(date, "HH:mm")}`;
  // return format(date, "dd/MM/yyyy HH:mm");
};

const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const [ConfirmDialog, confirm] = UseConfirm(
    "Tem certeza que deseja excluir essa mensagem?",
    "Essa ação não pode ser desfeita."
  );

  const { onOpenMessage, onCloseMessage, parentMessageId } = usePanel();

  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();

  const { mutate: deleteMessage, isPending: isDeletingMessage } =
    useDeleteMessage();

  const { mutate: toggleReaction, isPending: isToggleReaction } =
    useToggleReaction();

  const isPending = isUpdatingMessage;

  const handleReaction = (value: string) => {
    toggleReaction(
      { value, messageId: id },
      {
        onError: () => {
          toast.error("Erro ao reagir a mensagem");
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) return;

    deleteMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Mensagem excluída com sucesso");
          if (parentMessageId === id) {
            onCloseMessage();
          }
        },
        onError: () => {
          toast.error("Erro ao excluir mensagem");
        },
      }
    );
  };

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Mensagem atualizada com sucesso");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Erro ao atualizar mensagem");
        },
      }
    );
  };

  const avatarFallback = authorName.charAt(0).toUpperCase();

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />

        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-grey-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c14433]",
            isDeletingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "HH:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (editado)
                  </span>
                ) : null}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleDelete}
              hideThreadButton={hideThreadButton}
              handleReaction={handleReaction}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-grey-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c14433]",
          isDeletingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button>
            <Avatar>
              <AvatarImage src={authorImage} />

              <AvatarFallback className=" bg-sky-500 text-white text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full ">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={() => {}}
                  className="font-bold text-primary hover:underline"
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {formatFullTime(new Date(createdAt))}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(editado)</span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleDelete}
            hideThreadButton={hideThreadButton}
            handleReaction={handleReaction}
          />
        )}
      </div>
    </>
  );
};

export default Message;
