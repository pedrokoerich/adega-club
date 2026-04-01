"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc/client";

/**
 * Hook that subscribes to Supabase Realtime for new messages in a conversation.
 * When a new message arrives, it invalidates the tRPC cache to trigger a refetch.
 */
export function useRealtimeMessages(conversationId: string) {
  const utils = trpc.useUtils();

  const invalidate = useCallback(() => {
    utils.chat.messages.invalidate({ conversationId });
    utils.chat.myConversations.invalidate();
  }, [conversationId, utils]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          invalidate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, invalidate]);
}
