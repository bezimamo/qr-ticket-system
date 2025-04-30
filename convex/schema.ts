// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tickets: defineTable(
    v.object({
      ticketId: v.string(),
      eventId: v.string(),
      used: v.boolean(),
    })
  ).index("by_ticketId", ["ticketId"]),
});
