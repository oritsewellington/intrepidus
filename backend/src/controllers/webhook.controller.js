import axios from "axios";
import crypto from "crypto";
import Vote from "../models/Vote.model.js";
import { creditVerifiedVote } from "./vote.controller.js";

export async function paystackWebhook(req, res) {
  try {
    const signature = req.headers["x-paystack-signature"];
    const expected = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest("hex");

    if (!signature || signature !== expected) {
      return res.status(401).send("Invalid signature.");
    }

    res.sendStatus(200); // ack Paystack immediately either way

    const event = req.body;
    if (event.event !== "charge.success") return;

    const { reference, status } = event.data;
    if (status !== "success") return;

    // Route by prefix: not ours, forward untouched to FASA's own webhook
    if (reference.startsWith("FASA_")) {
      axios
        .post("https://fasan.onrender.com/api/webhooks/paystack", req.rawBody, {
          headers: {
            "Content-Type": "application/json",
            "x-paystack-signature": signature,
          },
        })
        .catch((err) =>
          console.error("Failed to forward webhook to FASA:", err.message),
        );
      return;
    }

    // Route by prefix: not ours, forward untouched to TASA's own webhook
    if (reference.startsWith("TASA_")) {
      axios
        .post("https://tasan.onrender.com/api/webhooks/paystack", req.rawBody, {
          headers: {
            "Content-Type": "application/json",
            "x-paystack-signature": signature,
          },
        })
        .catch((err) =>
          console.error("Failed to forward webhook to TASA:", err.message),
        );
      return;
    }

    // else, it's INTREPIDUS's own reference — process as before
    const { amount } = event.data;
    const vote = await Vote.findOne({ reference });
    if (!vote) return;
    if (vote.status === "verified") return;

    if (amount !== vote.amount) {
      vote.status = "failed";
      await vote.save();
      console.error(`Webhook amount mismatch for reference ${reference}`);
      return;
    }

    await creditVerifiedVote(reference);
  } catch (error) {
    console.error("Error processing Paystack Webhook event:", error);
  }
}
