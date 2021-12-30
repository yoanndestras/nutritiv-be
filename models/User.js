const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema
({
    username: 
    {
        type: String,
        required: true,
        unique: true
    },
    email: 
    {
        type: String,
        required: true,
        unique: true
    },
    password: 
    {
        type: String
    },
    isAdmin: 
    {
        type: Boolean,
        default: false,
        required: true
    },
    isVerified:
    {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

var options = {
    errorMessages: {
        MissingPasswordError: 'No password was given',
        AttemptTooSoonError: 'Account is currently locked. Try again later',
        TooManyAttemptsError: 'Account locked due to too many failed login attempts',
        NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
        IncorrectPasswordError: 'Password or username are incorrect',
        IncorrectUsernameError: 'Password or username are incorrect',
        MissingUsernameError: 'No username was given',
        UserExistsError: 'A user with the given username is already registered'
    },
    limitAttempts: true, 
    maxAttempts: 5,
    interval: 200,
};

UserSchema.plugin(passportLocalMongoose, options);

let User = mongoose.model('User', UserSchema);
module.exports = User;