import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const validateTicket = mutation({
  args: {
    ticketId: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, { ticketId, eventId }) => {
    const ticket = await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("ticketId"), ticketId))
      .unique();

    if (!ticket) return { status: "invalid" };
    if (ticket.eventId !== eventId) return { status: "wrong_event" };
    if (ticket.used) return { status: "used" };

    await ctx.db.patch(ticket._id, { used: true });
    return { status: "valid" };
  },
});
