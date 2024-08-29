"use client";

import React, { useEffect, useState } from "react";
import CreateWorkspaceModal from "@/features/workspaces/components/create-workspace-modal";
import CreateChannelModal from "@/features/channels/components/create-channel-modal";

const Modals = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CreateWorkspaceModal />
      <CreateChannelModal />
    </>
  );
};

export default Modals;
