const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema
({
    username: 
    {
        type: String,
        required: true,
        unique: true
    },
    customerId :
    {
        type: String,
    },
    email: 
    {
        type: String,
        required: true,
        unique: false
    },
    password:
    {
        type: String
    },
    TFASecret:
    {
        type: String
    },
    TFARecovery:
    {
        type: Array
    },
    isAdmin: 
    {
        type: Boolean,
        default: false,
    },
    isVerified:
    {
        type: Boolean,
        default: false,
    },
    avatar:
    {
        type: String,
        default: 'PrPhdefaultAvatar.jpg'
    },
    provider:
    {
        type: String,
        default: 'local',
    },
    // addressDetails:
    // [
    //     {
    //         street:
    //         {
    //             type: String,
    //         },
    //         zip:
    //         {
    //             type: Number,
    //         },
    //         city:
    //         {
    //             type: String,
    //         },
    //         country:
    //         {
    //             type: String,
    //         },
    //         phoneNumber:
    //         {
    //             type: Number,
    //         }
    //     }
    // ],
    version: 
    {
        type: Number,
        immutable: true,
        default: 2,
    },
},
{
    timestamps: true,   //mongoose automatically do UpdateAt and CreatedAt
});

const options = {
    errorMessages: {
        MissingPasswordError: 'No password was given',
        AttemptTooSoonError: 'Account is currently locked. Try again later',
        TooManyAttemptsError: 'Account locked due to too many failed login attempts, Click "Forget Password" to change your password and unlock your account',
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