const mongoose = require("mongoose");
const { Schema, model: Model } = mongoose;

const schema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  },
});

schema.virtual("url").get(function () {
  return "/catalog/genre/" + this._id;
});

const model = Model("genre", schema);

module.exports = model;
