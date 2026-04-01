"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
  const t = useTranslations("chat");
  const { user, loading: authLoading } = useAuth();

  const { data: conversations, isLoading } = trpc.chat.myConversations.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 10000 }
  );

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">{t("messages")}</h1>
        <Link href="/auth/login"><Button>Entrar para continuar</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">{t("messages")}</h1>

      {!conversations?.length ? (
        <Card className="text-center py-12">
          <p className="text-lg text-muted mb-2">{t("noConversations")}</p>
          <p className="text-sm text-muted">{t("noConversationsDesc")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.otherParticipant?.user;
            const storeName = other?.sellerProfile?.storeName;
            return (
              <Link key={conv.id} href={`/mensagens/${conv.id}`}>
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:border-wine/20 ${
                    conv.unread ? "border-wine/30 bg-wine/5" : "border-border"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center shrink-0">
                    <span className="text-wine font-semibold text-sm">
                      {(storeName ?? other?.displayName ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {storeName ?? other?.displayName ?? t("unknownUser")}
                      </span>
                      {conv.unread && (
                        <span className="w-2 h-2 rounded-full bg-wine shrink-0" />
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-muted truncate">
                        {conv.lastMessage.senderId === user.id ? `${t("you")}: ` : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted shrink-0">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
