const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },
    fine: {
      type: Number,
      default: 0,
    },

    isFinePaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true },
  },
);

issueSchema.virtual("isLate").get(function () {
  if (this.returnDate) {
    return this.returnDate > this.dueDate;
  }
  return new Date() > this.dueDate && this.status !== "returned";
});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
