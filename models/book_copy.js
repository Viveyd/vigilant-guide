const mongoose = require("mongoose");
const { Schema, model: Model } = mongoose;
const { DateTime } = require("luxon");

const schema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "book", required: true }, // reference to the associated book
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

schema.virtual("url").get(function () {
  return "/catalog/book-copy/" + this._id;
});

schema.virtual("due_back_luxon").get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

schema.virtual("due_back_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate(); // format 'YYYY-MM-DD'
});

const model = Model("copy", schema, "book_copies");

module.exports = model;
