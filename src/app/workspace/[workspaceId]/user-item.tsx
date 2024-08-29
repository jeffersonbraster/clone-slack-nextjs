import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const useItemVariant = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface UserItemProps {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof useItemVariant>["variant"];
}

const UserItem = ({ id, label = "Membros", image, variant }: UserItemProps) => {
  const workspaceId = useWorkspaceId();

  const avatarFallback = label.charAt(0).toUpperCase();

  return (
    <Button
      variant={"transparent"}
      className={cn(useItemVariant({ variant }))}
      size={"sm"}
      asChild
    >
      <Link href={`/workspace/${workspaceId}/membros/${id}`}>
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarImage className="rounded-md" src={image} />
          <AvatarFallback className="rounded-md text-xs">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>

        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
};

export default UserItem;
