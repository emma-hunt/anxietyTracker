const mongoose = require('mongoose');

const { Schema } = mongoose;

const eventModel = new Schema(
  {
    latitude: {type:Number},
    longitude: {type:Number},
    steps: {type:Number},
    panicAttack:{type:Boolean},
  },
);

module.exports = mongoose.model('Event', eventModel);