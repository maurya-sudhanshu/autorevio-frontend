import Stripe from "stripe";
import { env } from "@/env";

const stripeSecretKey = env.STRIPE_SECRET_KEY;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});
