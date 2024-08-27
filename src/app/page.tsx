"use client";

import { useEffect, useMemo } from "react";
import UserButtom from "@/features/auth/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();

  const { data, isLoading } = useGetWorkspaces();

  const workspacesId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspacesId) {
      router.replace(`/workspace/${workspacesId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [workspacesId, isLoading, open, setOpen, router]);

  return (
    <div>
      <UserButtom />
    </div>
  );
}
