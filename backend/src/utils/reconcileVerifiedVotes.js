import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

import Vote from "../models/Vote.model.js";

dotenv.config();

const PAYSTACK_BASE = "https://api.paystack.co";
const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

// Small delay so we don't hammer Paystack's API / hit rate limits.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function reconcile() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const verifiedVotes = await Vote.find({ status: "verified" }).sort(
      "createdAt",
    );
    console.log(
      `Checking ${verifiedVotes.length} verified vote(s) against Paystack...\n`,
    );

    const problems = [];
    let dbTotal = 0;
    let confirmedTotal = 0;

    for (const vote of verifiedVotes) {
      dbTotal += vote.amount;

      try {
        const { data } = await axios.get(
          `${PAYSTACK_BASE}/transaction/verify/${vote.reference}`,
          { headers: paystackHeaders(), timeout: 10000 },
        );

        const real = data?.data;
        const realStatus = real?.status;
        const realAmount = real?.amount;

        if (!data.status || realStatus !== "success") {
          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: `Paystack status is "${realStatus}", not "success"`,
            dbAmount: vote.amount,
            paystackAmount: realAmount ?? "N/A",
            voterEmail: vote.voterEmail,
            candidateName: vote.candidateName,
          });
        } else if (realAmount !== vote.amount) {
          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: "Amount mismatch between DB and Paystack",
            dbAmount: vote.amount,
            paystackAmount: realAmount,
            voterEmail: vote.voterEmail,
            candidateName: vote.candidateName,
          });
        } else {
          confirmedTotal += vote.amount;
        }
      } catch (err) {
        // 404 from Paystack means the reference simply doesn't exist there
        const status = err.response?.status;
        problems.push({
          voteId: vote._id,
          reference: vote.reference,
          issue:
            status === 404
              ? "Reference does not exist on Paystack at all"
              : `Error checking Paystack: ${err.message}`,
          dbAmount: vote.amount,
          paystackAmount: "N/A",
          voterEmail: vote.voterEmail,
          candidateName: vote.candidateName,
        });
      }

      await sleep(150); // stay well under Paystack's rate limits
    }

    console.log("========== SUMMARY ==========");
    console.log(`Total votes checked:        ${verifiedVotes.length}`);
    console.log(`DB total (verified, kobo):  ${dbTotal}  (₦${dbTotal / 100})`);
    console.log(
      `Confirmed-good total (kobo):${confirmedTotal}  (₦${confirmedTotal / 100})`,
    );
    console.log(`Problem records found:      ${problems.length}`);
    console.log("==============================\n");

    if (problems.length > 0) {
      console.log(
        "PROBLEM RECORDS (these are inflating your DB revenue/votes):\n",
      );
      problems.forEach((p) => {
        console.log("----------------------------------------");
        console.log(`voteId:          ${p.voteId}`);
        console.log(`reference:       ${p.reference}`);
        console.log(`issue:           ${p.issue}`);
        console.log(`DB amount:       ₦${p.dbAmount / 100}`);
        console.log(
          `Paystack amount: ${p.paystackAmount === "N/A" ? "N/A" : "₦" + p.paystackAmount / 100}`,
        );
        console.log(`voterEmail:      ${p.voterEmail}`);
        console.log(`candidateName:   ${p.candidateName}`);
      });
      console.log("----------------------------------------");
      console.log(
        "\nReview each of these, then mark confirmed-bad ones as status: 'failed' and re-run your repair scripts.",
      );
    } else {
      console.log(
        "All verified votes match Paystack exactly. No issues found.",
      );
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reconcile();
