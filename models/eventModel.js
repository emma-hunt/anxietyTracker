const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventModel = new Schema(
  {
    latitude: {type:Number},
    longitude: {type:Number},
    steps: {type:Number},
    panicProbability:{type:Number, default: 0.0},
  },
);

module.exports = mongoose.model('Event', eventModel);