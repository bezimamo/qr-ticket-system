// convex/validateTicket.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const validateTicket = mutation({
  args: {
    ticketId: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, { ticketId, eventId }) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
      .unique();

    if (!ticket) {
      return { status: "invalid", message: "Ticket not found." };
    }

    if (ticket.used) {
      return { status: "used", message: "Ticket already used." };
    }

    if (ticket.eventId !== eventId) {
      return { status: "invalid", message: "Wrong event." };
    }

    await ctx.db.patch(ticket._id, { used: true });

    return { status: "valid", message: "Ticket validated successfully." };
  },
});
