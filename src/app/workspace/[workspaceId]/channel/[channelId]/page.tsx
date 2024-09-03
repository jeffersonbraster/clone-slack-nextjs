"use client";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChanneleId } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import Header from "./header";
import ChatInput from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";

const ChannelPage = () => {
  const channelId = useChanneleId();

  const { results } = useGetMessages({ channelId });
  const { data: channel, isLoading: channelLoading } = useGetChannel({
    id: channelId,
  });

  console.log({ results });

  if (channelLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Canal não encontrado
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />

      <div className="flex-1" />
      <ChatInput placeholder={`Escreva algo em #${channel.name}`} />
    </div>
  );
};

export default ChannelPage;
