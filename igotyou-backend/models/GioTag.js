const mongoose = require('mongoose');

const GeoLocationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true
  }
});

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  }
});

const AudioSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  }
});

const GioTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: true
  },
  adults: {
    type: Number,
    required: false
  },
  healthyAdults: {
    type: Number,
    required: false
  },
  children: {
    type: Number,
    required: false
  },
  geoLocation: {
    type: GeoLocationSchema,
    required: true
  },
  images: {
    type: [ImageSchema],
    required: false
  },
  audio: {
    type: [AudioSchema],
    required: false
  }
});

module.exports = mongoose.model('GioTag', GioTagSchema);
