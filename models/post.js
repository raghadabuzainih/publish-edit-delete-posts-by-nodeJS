const mongoose = require('mongoose')
const Log = require('./log')

const Schema = mongoose.Schema

const posting = new Schema({
    new_post:{
        type: String
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log'
    }
}, {toJSON : {virtuals: true}, timestamps: true}) 


posting.virtual('log', {
    ref: 'Log',
    localField: 'user_id', 
    foreignField: '._id'  
})

const Post = mongoose.model('Post', posting)
module.exports = Post