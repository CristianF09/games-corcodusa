import { Schema, model, models, type HydratedDocument } from "mongoose";
import { z } from "zod/v4";
import { nextSequence } from "./counter";

export interface UserAttrs {
  id: number;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  subscriptionTier: string;
  trialStartedAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserAttrs>(
  {
    id: { type: Number, unique: true, index: true },
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    subscriptionTier: { type: String, required: true, default: "free" },
    trialStartedAt: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
  },
  {
    // Disable Mongoose's default `id` virtual — we define our own numeric
    // `id` field above (see schema/games.ts for the full rationale).
    id: false,
    timestamps: true,
  },
);

userSchema.pre("save", async function assignId() {
  if (this.isNew && this.id == null) {
    this.id = await nextSequence("users");
  }
});

export type UserDocument = HydratedDocument<UserAttrs>;
export const UserModel = models.User ?? model<UserAttrs>("User", userSchema);

export const insertUserSchema = z.object({
  clerkId: z.string(),
  email: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
