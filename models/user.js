//using mongoose to connect mongodb
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/nodeauth', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false, useCreateIndex: true});
var db = mongoose.connection;

//User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileimage: {
        type: String
    }
});

//export User schema
var User = module.exports = mongoose.model('User', UserSchema);

//export createUser function
module.exports.createUser = function(newUser, callback){
    //newUser.save(callback); //mongoose function to insert to DB
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            // Store hash in your password DB.
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};