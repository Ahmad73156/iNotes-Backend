const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    //This will delete the userdata from mongodb after the logic define at key :"default" , atg here data will be deleted  in mongodb after "1 hour
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 3600000), // 1 hour from now
    },
    
});

module.exports = mongoose.model('User', UserSchema);
