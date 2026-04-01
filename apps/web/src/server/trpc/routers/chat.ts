import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";

export const chatRouter = router({
  // List user's conversations
  myConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.db.conversation.findMany({
      where: {
        participants: { some: { userId: ctx.user.id } },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                sellerProfile: { select: { storeName: true, verificationStatus: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
    });

    return conversations.map((conv) => ({
      ...conv,
      otherParticipant: conv.participants.find((p) => p.userId !== ctx.user.id),
      lastMessage: conv.messages[0] ?? null,
      unread: conv.participants.find((p) => p.userId === ctx.user.id)?.lastReadAt
        ? conv.messages[0]?.createdAt > conv.participants.find((p) => p.userId === ctx.user.id)!.lastReadAt!
        : !!conv.messages[0],
    }));
  }),

  // Get or create conversation with a user (optionally about a listing)
  getOrCreate: protectedProcedure
    .input(
      z.object({
        otherUserId: z.string().uuid(),
        listingId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.otherUserId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot message yourself" });
      }

      // Check if conversation already exists between these users
      const existing = await ctx.db.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: ctx.user.id } } },
            { participants: { some: { userId: input.otherUserId } } },
          ],
          ...(input.listingId ? { listingId: input.listingId } : {}),
        },
      });

      if (existing) return { id: existing.id };

      // Create new conversation
      const conversation = await ctx.db.conversation.create({
        data: {
          listingId: input.listingId ?? null,
          participants: {
            create: [
              { userId: ctx.user.id },
              { userId: input.otherUserId },
            ],
          },
        },
      });

      return { id: conversation.id };
    }),

  // Get messages for a conversation
  messages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        cursor: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is participant
      const participant = await ctx.db.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.user.id,
          },
        },
      });
      if (!participant) throw new TRPCError({ code: "FORBIDDEN" });

      const messages = await ctx.db.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          sender: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (messages.length > input.limit) {
        const next = messages.pop();
        nextCursor = next?.id;
      }

      // Mark as read
      await ctx.db.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      });

      return { messages, nextCursor };
    }),

  // Send a message
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is participant
      const participant = await ctx.db.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId: ctx.user.id,
          },
        },
      });
      if (!participant) throw new TRPCError({ code: "FORBIDDEN" });

      const [message] = await ctx.db.$transaction([
        ctx.db.message.create({
          data: {
            conversationId: input.conversationId,
            senderId: ctx.user.id,
            content: input.content,
          },
          include: {
            sender: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        }),
        ctx.db.conversation.update({
          where: { id: input.conversationId },
          data: { updatedAt: new Date() },
        }),
        ctx.db.conversationParticipant.update({
          where: { id: participant.id },
          data: { lastReadAt: new Date() },
        }),
      ]);

      return message;
    }),

  // Get conversation detail (participants, listing info)
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.id,
          participants: { some: { userId: ctx.user.id } },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                  sellerProfile: { select: { storeName: true, verificationStatus: true } },
                },
              },
            },
          },
        },
      });
      if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        ...conversation,
        otherParticipant: conversation.participants.find((p) => p.userId !== ctx.user.id),
      };
    }),
});
