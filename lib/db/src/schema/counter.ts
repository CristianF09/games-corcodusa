import { Schema, model, models } from "mongoose";

interface CounterAttrs {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterAttrs>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

// `models.Counter ?? model(...)` guards against "Cannot overwrite model once
// compiled" errors when this module is re-evaluated in dev (tsx --watch
// reload) within the same process.
export const CounterModel = models.Counter ?? model<CounterAttrs>("Counter", counterSchema);

/**
 * Atomically allocates the next integer in a named sequence (e.g. "games",
 * "users"). MongoDB's native `_id` is a non-numeric ObjectId, but the public
 * API contract (openapi.yaml) types every resource `id` as `integer` — this
 * mirrors what Postgres `serial` columns did, so nothing above the database
 * layer (routes, generated API client, frontend) had to change.
 */
export async function nextSequence(name: string): Promise<number> {
  const counter = await CounterModel.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean<CounterAttrs>();
  return counter!.seq;
}
