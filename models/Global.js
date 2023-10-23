const mongoose = require('mongoose'), Schema = mongoose.Schema;

const globalSchema = new Schema({
    user:
        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    ,
    title: {type:String,required: true},
    post: {type:String,required: true},
    timestamp: {
      type: Date,
    default: Date.now
    }
})
const Global = mongoose.model("Global", globalSchema);

module.exports = Global;