"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: Props) {
  const { id } = use(params);
  const t = useTranslations("chat");
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation } = trpc.chat.getById.useQuery({ id });
  const { data: messagesData, isLoading } = trpc.chat.messages.useQuery(
    { conversationId: id },
  );

  // Subscribe to real-time message updates via Supabase Realtime
  useRealtimeMessages(id);

  const utils = trpc.useUtils();
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.chat.messages.invalidate({ conversationId: id });
      utils.chat.myConversations.invalidate();
    },
  });

  const other = conversation?.otherParticipant?.user;
  const storeName = other?.sellerProfile?.storeName;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({ conversationId: id, content: message.trim() });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/mensagens">
          <Button variant="ghost" size="sm">&larr;</Button>
        </Link>
        <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center">
          <span className="text-wine font-semibold">
            {(storeName ?? other?.displayName ?? "?")[0].toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold">
            {storeName ?? other?.displayName ?? t("unknownUser")}
          </h1>
          {other?.sellerProfile?.verificationStatus === "VERIFIED" && (
            <Badge variant="green" className="text-[10px] px-1.5 py-0">
              {t("verified")}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 border border-border rounded-lg p-4">
        {messagesData?.messages
          .slice()
          .reverse()
          .map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isMine
                      ? "bg-wine text-white"
                      : "bg-surface-2 text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? "text-white/60" : "text-muted"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <div className="flex-1">
          <Input
            id="chatMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("typeMessage")}
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
          {t("send")}
        </Button>
      </form>
    </div>
  );
}
