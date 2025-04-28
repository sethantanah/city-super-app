import mongoose from "mongoose";

const waitList = new mongoose.Schema(
  {
    intent: String,
    email: String,
  },
  {
    timestamps: true,
  }
);

const WaitList = mongoose.model("WaitList", waitList);

export default WaitList;
