const mongoose = require('mongoose');

const ResumeSchema = mongoose.Schema({
    name: String,
    uid: String,
    profiles: Object,
});

module.exports = mongoose.model('Resume', ResumeSchema);

