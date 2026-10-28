import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at").notNull(),
});
export const sessions = sqliteTable("sessions", {
  hash: text("hash").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, {onDelete:"cascade"}),
  expiresAt: integer("expires_at").notNull(),
}, t => [index("sessions_expiration").on(t.expiresAt)]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  requestKey: text("request_key").notNull(),
  number: text("number").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  method: text("method").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  comment: text("comment").notNull().default(""),
  requestedDate: text("requested_date"),
  itemsJson: text("items_json").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at").notNull(),
}, (t) => [index("orders_user_created").on(t.userId, t.createdAt), uniqueIndex("orders_user_request").on(t.userId, t.requestKey)]);
