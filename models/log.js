const mongoose = require('mongoose')

const Schema = mongoose.Schema

const emailSchema = new Schema({
    fullName:{
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},
{ timestamps: true } 
)

const Log = mongoose.model('Log', emailSchema)

module.exports = Log