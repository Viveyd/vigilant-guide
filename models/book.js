const mongoose = require("mongoose");
const { Schema, model: Model } = mongoose;

const schema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "author", required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "genre" }],
});

schema.virtual("url").get(function () {
  return "/catalog/book/" + this._id;
});

const model = Model("book", schema);

module.exports = model;
