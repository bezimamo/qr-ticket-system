import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const validateTicket = mutation({
  // ✅ Declare expected args here
  args: {
    ticketId: v.string(),
    eventId: v.string(),
  },

  // ✅ Then the actual function handler
  handler: async (ctx, { ticketId, eventId }) => {
    try {
      const ticket = await ctx.db
        .query("tickets")
        .filter((q) => q.eq(q.field("ticketId"), ticketId))
        .unique();

      if (!ticket) {
        console.error(`Ticket not found: ${ticketId}`);
        return { status: "invalid", message: "Ticket not found." };
      }

      if (ticket.eventId !== eventId) {
        console.warn(`Wrong event. Expected ${ticket.eventId}, got ${eventId}`);
        return { status: "wrong_event", message: "Ticket is for a different event." };
      }

      if (ticket.used) {
        return { status: "used", message: "Ticket has already been used." };
      }

      await ctx.db.patch(ticket._id, { used: true });
      return { status: "valid", message: "Ticket validated successfully!" };
    } catch (err) {
      console.error("Server error in validateTicket:", err);
      return { status: "error", message: "Server error validating ticket." };
    }
  },
});
