import { Schema, model, models, type HydratedDocument } from "mongoose";
import { z } from "zod/v4";
import { nextSequence } from "./counter";

export interface GameAttrs {
  id: number;
  title: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  imageUrl: string;
  gameUrl: string | null;
  // Stored as `isNewGame`, not `isNew` — every Mongoose document already has
  // a built-in `isNew` property (true until the doc is first saved), so a
  // schema field literally named `isNew` would collide with it. The public
  // API still calls this field `isNew`; routes/games.ts renames it on the
  // way out (see serializeGame).
  isNewGame: boolean;
  isFeatured: boolean;
  requiresSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<GameAttrs>(
  {
    id: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    ageMin: { type: Number, required: true, default: 3 },
    ageMax: { type: Number, required: true, default: 8 },
    imageUrl: { type: String, required: true },
    gameUrl: { type: String, default: null },
    isNewGame: { type: Boolean, required: true, default: false },
    isFeatured: { type: Boolean, required: true, default: false },
    requiresSubscription: { type: Boolean, required: true, default: true },
  },
  {
    // Disable Mongoose's default `id` virtual (which would otherwise return
    // `_id.toHexString()`) — we define our own numeric `id` field above.
    id: false,
    timestamps: true,
  },
);

// No `next` callback parameter: Mongoose treats a 0-arg pre-hook as
// promise-based in both v8 and v9 (v9 removed the `next` callback form
// entirely), so this is the one style that's correct on either version.
gameSchema.pre("save", async function assignId() {
  if (this.isNew && this.id == null) {
    this.id = await nextSequence("games");
  }
});

export type GameDocument = HydratedDocument<GameAttrs>;
export const GameModel = models.Game ?? model<GameAttrs>("Game", gameSchema);

export const insertGameSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  ageMin: z.number().int().default(3),
  ageMax: z.number().int().default(8),
  imageUrl: z.string(),
  gameUrl: z.string().nullable().optional(),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  requiresSubscription: z.boolean().default(true),
});
export type InsertGame = z.infer<typeof insertGameSchema>;
