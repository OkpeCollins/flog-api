const mongoose = require("mongoose");

//Connecting to mongodb
mongoose.connect("mongodb://localhost/mongofrog", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

//Checking for connection status
mongoose.connection.once('open', function() {
    //console.log('Connection made successfully')
}).on('error', function(error) {
    console.log('Connection error:', error)
});