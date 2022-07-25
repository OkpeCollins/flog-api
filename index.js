const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const path = require('path');
const detenv = require('dotenv-safe').config({ allowEmptyValues: true });
const userRoute = require('./routes/user');
const riderRoute = require('./routes/rider');
const eje = require('ejs');
const fleetController = require('./controller/fleet');
const fleetRoute = require('./routes/fleet');
const adminRoute = require("./routes/admin")
const db = require('./config/database');
const server = require('http').createServer(app);
const User = require('./models/user');
const Trip = require('./models/trip');
const Fleet = require('./models/fleet');
const OnlineRider = require('./models/onlineRider');
const Rider = require('./models/rider');
const Transaction = require('./models/transaction');
const Settings = require('./models/settings');
const flash = require('express-flash')
const Token = require('./models/token');
const session = require('express-session')
const passport = require('passport');
const moment = require('moment');


// const bodyParser = require('body-parser'); // middleware
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const userFunctions = require('./controller/user');
const axios = require('axios');
// require('./seeder/admin');
// require('./seeder/settings')

// default options
app.use(fileUpload());

//support parsing of application/x-www-form-urlencoded post data
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '100mb' }));
// app.use(express.bodyParser({limit: '50mb'}));
//authentication
var hour = 3600000
app.use(session({
    cookie: { maxAge: 100 * hour },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//Flash
app.use(flash())

//request handling
app.use(morgan('dev'));

//payload size increase

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.urlencoded({ extended: false }));

//Template Engine
app.set('views', path.join(__dirname, 'views/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


//STATIC PUBLIC FILES
app.use(express.static(path.join(__dirname, 'public')))

//routes
app.use('/', userRoute);
app.use('/', fleetRoute);
app.use('/', adminRoute);
app.use('/', riderRoute);

//error page handling
app.use((req, res, next) => {
    const error = new Error('Page not found');
    error.status = 404;
    next(error);
})
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

//header authorization
// app.use((req, res, next) => {
//     res.header('Acess-Control-Allow-Origin', '*')
//     res.header('Content-Type: application/json; charset=utf-8')
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
//     if (req.method === "OPTIONS") {
//         res.header('Access-Control-Allow-Methods', 'PATCH, POST, DELETE, GET')
//         return res.status(200).json();
//     }
// })


io.on('connection', (socket) => {
    console.log('a user connected');

    async function getNotificationToken(id) {
        try {
            var rider = await Rider.findOne({ _id: id });
            var user = await User.findOne({ _id: id });
            if (user == null) {
                return rider.notificationToken
            }
            if (rider == null) {
                return user.notificationToken;
            }
        } catch (error) {
            console.log(error)
            res.status(407).json({
                error: error
            })
        }
    }

    socket.on('driverOnline', (driver) => {
        //this will be emitted from drivers end and the driver will join the driverId room
        console.log(driver.name + ' joining ' + driver.id);
        socket.join(driver.id);
        io.to(driver.id).emit("driverOnline", driver.id);
    });

    socket.on('notificationSubscribe', (notificationToken) => {
        //this will be emitted from drivers end and the driver will join the driverId room
        console.log('notificationSubscribe........................')
        socket.join(notificationToken);
        // io.to(driver.id).emit("driverOnline", driver.id);
    });

    socket.on('findDriver', (trip) => {
        //this will be emitted from user end and the user will join the tripId room first
        console.log(trip);
        socket.join(trip.id)
        var data = trip.excludesRiders;
        //find driver with the closer proximity based on the online table
        //then use their id to emit trip details
        try {
            Trip.findOne({ _id: trip.id })
                .then(tripData => {
                    if (tripData.status == "Pending") {
                        Settings.findOne({ id: 1 })
                            .then(settings => {
                                if (settings != null) {
                                    OnlineRider.find({ status: "Active" })
                                        .then(driver => {
                                            console.log(driver)
                                            if (driver != null) {
                                                driver.forEach(function (item, index, array) {
                                                    if (data) {
                                                        console.log('excludesRiders found')
                                                        if (data.includes(item.riderId) == false) {
                                                            axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + trip.destination.latitude + ',' + trip.destination.longitude + '&destinations=' + item.destination.latitude + '%2C' + item.destination.longitude + '&key=' + settings.googgleMap.API + '')
                                                                .then(locationDistance => {
                                                                    if (locationDistance.data.rows[0].elements[0].distance.value <= 10000) {
                                                                        var msg = {
                                                                            driver: item.riderId,
                                                                            response: locationDistance.data
                                                                        }
                                                                        io.to(item.riderId).emit("notifyDriver", trip);
                                                                        io.to(trip.id).emit("notifyDriver", { riderId: item.riderId, trip });
                                                                        return;
                                                                    } else {
                                                                        console.log('A driver skipped')
                                                                        if (array.length - 1 == index) {
                                                                            console.log("rider not found within 10km ranmge")
                                                                            io.to(trip.id).emit("noDriver", 'No driver found');
                                                                            // console.log(locationDistance.data)
                                                                        }
                                                                    }
                                                                })
                                                                .catch(locationDistanceError => {
                                                                    console.log(locationDistanceError, "error")
                                                                    io.to(trip.id).emit("noDriver", 'No driver found');
                                                                })
                                                        } else {
                                                            console.log('A driver skipped')
                                                            if (array.length - 1 == index) {
                                                                console.log("rider not found within 10km ranmge")
                                                                io.to(trip.id).emit("noDriver", 'No driver found');
                                                                // console.log(locationDistance.data)
                                                            }
                                                            // io.to(trip.id).emit("noDriver", 'No driver found');
                                                        }
                                                    } else {
                                                        axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + trip.destination.latitude + ',' + trip.destination.longitude + '&destinations=' + item.destination.latitude + '%2C' + item.destination.longitude + '&key=' + settings.googgleMap.API + '')
                                                            .then(locationDistance => {
                                                                if (locationDistance.data.rows[0].elements[0].distance.value <= 10000) {
                                                                    //Driver's ID
                                                                    io.to(item.riderId).emit("notifyDriver", trip);
                                                                    io.to(trip.id).emit("notifyDriver", { riderId: item.riderId, trip });
                                                                    return;
                                                                } else {
                                                                    console.log('A driver skipped')
                                                                    if (array.length - 1 == index) {
                                                                        console.log("rider not found within 10km ranmge")
                                                                        io.to(trip.id).emit("noDriver", 'No driver found');
                                                                        // console.log(locationDistance.data)
                                                                    }
                                                                    // console.log(locationDistance.data, "rider not found within 10km ranmge")
                                                                    // io.to(trip.id).emit("noDriver", 'No driver found');
                                                                }
                                                            })
                                                            .catch(locationDistanceError => {
                                                                console.log(locationDistanceError)
                                                            })
                                                    }
                                                })
                                            } else {
                                                console.log('Rider Not Found')
                                                io.to(trip.id).emit("noDriver", 'No driver found');
                                            }
                                        })
                                        .catch(error => {
                                            console.log(error)
                                        })
                                }
                            })
                            .catch(err => {
                                console.log(err)
                            })
                    } else {
                        console.log('Trip status is not Pending')
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }

    })

    socket.on('driverAccept', (data) => {
        //this from driver end and driver will also join the trip id
        console.log(data)
        socket.join(data.tripId)
        console.log(data.tripId)
        //they have already join room with id above and to emmit to those IDs now

        //Acept Query
        try {
            Trip.findOne({ _id: data.tripId })
                .then(tripData => {
                    User.findOne({ _id: tripData.userId })
                        .then(user => {
                            OnlineRider.findOne({ riderId: data.riderId })
                                .then(riderData => {
                                    Rider.findOne({ _id: riderData.riderId })
                                        .then(rider => {
                                            //console.log(rider);
                                            Trip.updateOne({ _id: data.tripId }, { $set: { status: "Accepted", riderId: rider._id, riderData: { id: rider._id, name: rider.fullName, email: rider.email.value, mobile: rider.mobile.value, profilePicture: { mimeType: rider.profilePicture.mimeType, value: rider.profilePicture.value } } } })
                                                .then(tripUpdate => {
                                                    Trip.count({ riderId: riderData.riderId, status: "Completed" })
                                                        .then(countTrip => {
                                                            //Emit to Trip ID
                                                            console.log(user);
                                                            let userData = {
                                                                name: user.name,
                                                                mobile: user.mobile.value,
                                                                userId: user._id,
                                                            }

                                                            let riderData = {
                                                                name: rider.fullName,
                                                                mobile: rider.mobile.value,
                                                                profilePicture: rider.profilePicture,
                                                                RiderTrips: countTrip
                                                            }

                                                            var msg = {
                                                                RiderId: rider.id,
                                                                userData,
                                                                riderData,
                                                                tripData,
                                                            }

                                                            console.log(msg);
                                                            io.to(riderData.riderId).emit("tripAccepted", msg);
                                                            io.to(tripData.id).emit("tripAccepted", msg);
                                                        })
                                                        .catch(countTripError => {
                                                            console.log(countTripError)
                                                        })
                                                })
                                                .catch(countTripError => {
                                                    console.log(countTripError)
                                                })
                                        })
                                        .catch()
                                })
                                .catch(riderError => {
                                    console.log(riderError)
                                })
                        })
                        .catch(userError => {
                            console.log(userError)
                        })
                })
                .catch(err => {
                    res.status(407).json({
                        message: "Trip Not Found",
                        data: err,
                    })
                })
        } catch (error) {
            console.log(error)
        }

        // socket.to(data.id).emit("driverAccept", data.id, msg);
    })

    socket.on('noResponseFromDriver', (trip) => {
        console.log('noResponseFromDriver..................');
        //Cancel Query
        // var trip_id = trip.id;
        // var data = trip.excludesRiders;
        let excludesRidersLength = trip.excludesRiders.length;
        // console.log(trip);
        // io.emit('findDriver', trip);
        io.to(trip.excludesRiders[excludesRidersLength - 1]).emit("lateResponse", 'msg');
        io.to(trip.id).emit("noResponseFromDriver", trip);
    })

    socket.on('startTrip', (trip_id) => {
        //they have already join room with id above and to emmit to those IDs now
        socket.join(trip_id)
        //Acept Query
        try {
            Trip.updateOne({ _id: trip_id }, { $set: { status: "Ongoing" } })
                .then(async result => {
                    var rider = await Trip.find(({ _id: trip_id }))
                    console.log(rider[0].riderData.id)
                    OnlineRider.updateOne({ riderId: rider[0].riderData.id }, { $push: { trips: { id: trip_id } } })
                        .then(start => {
                            var msg = {
                                message: result,
                                response: start
                            };
                            fleetController.createTransaction(trip_id);
                            console.log(start);
                            io.to(trip_id).emit("startTrip", msg);
                            io.to(result.riderId).emit("startTrip", msg);
                        })
                        .catch(error2 => {
                            console.log(error2)
                        })
                        .catch(error => {
                            console.log(error)
                        })
                })
                .catch(error => {
                    console.log(error)
                })
        } catch (error) {
            io.to(result.riderId).emit("startTripError", msg);
        }
        // socket.to(data.id).emit("driverAccept", data.id, msg);
    })

    socket.on('riderCancelTrip', (trip_id) => {
        //they have already join room with id above and to emmit to those IDs now

        //Cancel Query
        try {
            Trip.findOne({ _id: trip_id })
                .then(tripData => {
                    if (tripData.status == "Accepted") {
                        Trip.updateOne({ _id: trip_id }, { $set: { status: "Cancelled" } })
                            .then(result => {
                                socket.to(trip_id).emit("riderCancelTrip", 'Trip cancelled by rider');
                                socket.to(tripData.riderId).emit("riderCancelTrip", 'Trip cancelled by rider');
                            })
                            .catch(error => {
                                res.status(422).json({
                                    error: "error",
                                    response: error
                                })
                            })
                    } else {
                        console.log("Trip is not Accepted")
                    }
                })
                .catch(error => {
                    res.status(422).json({
                        error: "error",
                        response: error
                    })
                })
        } catch (error) {
            res.status(422).json({
                error: error
            })
        }
        // socket.to(data.id).emit("driverAccept", data.id, msg);
    })


    socket.on('deliverTrip', (trip_id) => {
        //they have already join room with id above and to emmit to those IDs now
        socket.join(trip_id)

        //Cancel Query
        async function deliver(trip_id) {

            try {
                Trip.findOne({ _id: trip_id })
                    .then(tripData => {
                        if (tripData.status == "Ongoing") {
                            if (tripData.paymentType == "Card") {
                                User.findOne({ _id: tripData.userId })
                                    .then(userData => {
                                        if (userData.defaultPaymentType == "Card") {
                                            // console.log(userData)
                                            Token.findOne({ userId: tripData.userId, default: true })
                                                .then(token => {
                                                    Settings.findOne({ id: 1 })
                                                        .then(settings => {
                                                            if (settings != null) {
                                                                console.log('............................' + 'settingd flw')
                                                                const Flutterwave = require('flutterwave-node-v3');
                                                                const flw = new Flutterwave(settings.payment.publicKey, settings.payment.secretKey);
                                                                const charge_with_token = async () => {
                                                                    try {
                                                                        const payload = {
                                                                            "token": token.token, //This is the card token returned from the transaction verification endpoint as data.card.token
                                                                            "currency": "NGN",
                                                                            "country": "NG",
                                                                            "amount": tripData.price,
                                                                            "email": userData.email.value,
                                                                            "first_name": userData.name,
                                                                            "last_name": userData.name,
                                                                            "narration": tripData.destination.text,
                                                                            "tx_ref": "MCs" + Date.now(),
                                                                            "redirect_url": "https://www.google.com"
                                                                        }
                                                                        const response = await flw.Tokenized.charge(payload)
                                                                        if (response.status == "success") {
                                                                            OnlineRider.updateOne({ riderId: tripData.riderId }, { $pull: { "trips": { id: trip_id } } })
                                                                                .then(pull => {
                                                                                    Trip.updateOne({ _id: trip_id }, { $set: { status: "Completed", paymentStatus: "Paid" } })
                                                                                        .then(result => {
                                                                                            fleetController.updateTransactionWithPaid(trip_id);
                                                                                            var msg = {
                                                                                                message: result,
                                                                                                response: response,
                                                                                                riderId: tripData.riderId,
                                                                                                tripId: tripData._id
                                                                                            };
                                                                                            io.to(trip_id).emit("deliverTrip", msg);
                                                                                            io.to(tripData.riderId).emit("deliverTrip", msg);
                                                                                        })
                                                                                        .catch(error => {
                                                                                            console.log(error)
                                                                                            io.to(trip_id).emit("deliverTripError", error);
                                                                                            io.to(tripData.riderId).emit("deliverTripError", error);
                                                                                        })
                                                                                })
                                                                                .catch(pullError => {
                                                                                    console.log(pullError)
                                                                                })
                                                                        } else {
                                                                            OnlineRider.updateOne({ riderId: tripData.riderId }, { $pull: { "trips": { id: trip_id } } })
                                                                                .then(pull => {
                                                                                    console.log(pull)
                                                                                    Trip.updateOne({ _id: trip_id }, { $set: { status: "Completed" } })
                                                                                        .then(result => {
                                                                                            fleetController.updateTransactionWithNotPaid(trip_id);
                                                                                            var msg = {
                                                                                                message: result,
                                                                                                response: response,
                                                                                                riderId: tripData.riderId,
                                                                                                tripId: tripData._id
                                                                                            };
                                                                                            io.to(trip_id).emit("deliverTrip", msg);
                                                                                            io.to(tripData.riderId).emit("deliverTrip", msg);
                                                                                        })
                                                                                        .catch(error => {
                                                                                            io.to(trip_id).emit("deliverTripError", error);
                                                                                            io.to(tripData.riderId).emit("deliverTripError", error);
                                                                                        })
                                                                                })
                                                                                .catch(pullError => {
                                                                                    console.log(pullError)
                                                                                })
                                                                        }
                                                                    } catch (error) {
                                                                        io.to(trip_id).emit("deliverTripError", error);
                                                                        io.to(tripData.riderId).emit("deliverTripError", error);
                                                                    }

                                                                }
                                                                charge_with_token();
                                                            }
                                                        })
                                                        .catch(settingsError => {
                                                            io.to(trip_id).emit("deliverTripError", settingsError);
                                                            io.to(tripData.riderId).emit("deliverTripError", settingsError);
                                                        })
                                                })
                                                .catch(tokenError => {
                                                    io.to(trip_id).emit("deliverTripError", tokenError);
                                                    io.to(tripData.riderId).emit("deliverTripError", tokenError);
                                                })
                                        } else {
                                            Trip.updateOne({ _id: trip_id }, { $set: { status: "Completed", paymentStatus: "Paid" } })
                                                .then(result => {

                                                    OnlineRider.updateOne({ riderId: tripData.riderId }, { $pull: { "trips": { id: trip_id } } })
                                                        .then(pull => {
                                                            fleetController.updateTransactionWithPaid(trip_id)
                                                            Trip.updateOne({ _id: trip_id }, { $set: { status: "Completed" } })
                                                                .then(result => {
                                                                    var msg = {
                                                                        message: result,
                                                                        response: response,
                                                                        riderId: tripData.riderId,
                                                                        tripId: tripData._id
                                                                    };
                                                                    io.to(trip_id).emit("deliverTrip", msg);
                                                                    io.to(tripData.riderId).emit("deliverTrip", msg);
                                                                })
                                                                .catch(error => {
                                                                    io.to(trip_id).emit("deliverTripError", error);
                                                                    io.to(tripData.riderId).emit("deliverTripError", error);
                                                                })
                                                        })
                                                        .catch(pullError => {
                                                            console.log(pullError)
                                                        })
                                                })
                                                .catch(error => {
                                                    console.log("trip update error" + error)
                                                    io.to(trip_id).emit("deliverTripError", error);
                                                    io.to(tripData.riderId).emit("deliverTripError", error);
                                                })
                                        }
                                    })
                                    .catch(userError => {
                                        console.log("userdata error")
                                        io.to(trip_id).emit("deliverTripError", userError);
                                        io.to(tripData.riderId).emit("deliverTripError", userError);
                                    })
                            } else {
                                Trip.updateOne({ _id: trip_id }, { $set: { status: "Completed", paymentStatus: "Paid" } })
                                    .then(result => {
                                        OnlineRider.updateOne({ riderId: tripData.riderId }, { $pull: { "trips": { id: trip_id } } })
                                            .then(pull => {
                                                Trip.updateOne({ _id: trip_id }, { $set: { status: "Completed" } })
                                                    .then(result => {
                                                        fleetController.updateTransactionWithPaid(trip_id)
                                                        var msg = {
                                                            message: result,
                                                            response: result,
                                                            riderId: tripData.riderId,
                                                            tripId: tripData._id
                                                        };
                                                        io.to(trip_id).emit("deliverTrip", msg);
                                                        io.to(tripData.riderId).emit("deliverTrip", msg);
                                                    })
                                                    .catch(error => {
                                                        io.to(trip_id).emit("deliverTripError", error);
                                                        io.to(tripData.riderId).emit("deliverTripError", error);
                                                    })
                                            })
                                            .catch(pullError => {
                                                console.log(pullError)
                                            })
                                    })
                                    .catch(error => {
                                        console.log("trip update error")
                                        io.to(trip_id).emit("deliverTripError", error);
                                        io.to(tripData.riderId).emit("deliverTripError", error);
                                    })
                            }
                        } else {
                            console.log(tripData)
                            console.log("Trip is not an Ongoing Trip")
                            io.to(trip_id).emit("deliverTripError", "Trip is not an Ongoing Trip");
                            io.to(tripData.riderId).emit("deliverTripError", "Trip is not an Ongoing Trip");
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
            } catch (error) {
                console.log(error)
            }
        }

        deliver(trip_id)
        // socket.to(data.id).emit("driverAccept", data.id, msg);
    })
    // socket.emit('createTripResponse', (msg) => {
    //     console.log('data: ' + msg.userId);
    // });

    socket.on('riderReject', (trip) => {
        //they have already join room with id above and to emmit to those IDs now
        console.log(trip);
        //Cancel Query
        // var trip_id = trip.id;
        // var data = trip.excludesRiders;
        let excludesRidersLength = trip.excludesRiders.length;
        console.log(trip);
        // io.emit('findDriver', trip);
        io.to(trip.excludesRiders[excludesRidersLength - 1]).emit("riderReject", 'msg');
        io.to(trip.id).emit("riderReject", trip);
    })

    socket.on('cancelTripWhenPending', (trip_id) => {
        socket.join(trip_id)
        //they have already join room with id above and to emmit to those IDs now

        //Cancel Query
        try {
            Trip.findOne({ _id: trip_id })
                .then(tripData => {
                    if (tripData.status == "Pending" || tripData.status == "Accepted") {
                        Trip.updateOne({ _id: trip_id }, { $set: { status: "Cancelled" } })
                            .then(result => {
                                console.log("cancelTripWhenPending emittint")
                                io.to(trip_id).emit("cancelTripWhenPending", 'Trip cancelled by user');
                                io.to(tripData.riderId).emit("cancelTripWhenPending", 'Trip cancelled by user');
                            })
                            .catch(error => {
                                io.to(trip_id).emit("cancelTripWhenPendingError", 'Error cancelling trip');

                            })
                    } else {
                        console.log("Trip is not Pending")
                        io.to(trip_id).emit("cancelTripWhenPendingError", 'Error cancelling trip');
                    }
                })
                .catch(error => {
                    res.status(422).json({
                        error: "error",
                        response: error
                    })
                })
        } catch (error) {
            res.status(422).json({
                error: error
            })
        }
        // socket.to(data.id).emit("driverAccept", data.id, msg);
    })
    // socket.emit('createTripResponse', (msg) => {
    //     console.log('data: ' + msg.userId);
    // });
    socket.on('joinChatRoom', (trip_id) => {
        console.log('joining ......');
        socket.join(trip_id)
    })

    socket.on('chatMessage', (data) => {
        // socket.join(trip_id)
        console.log('sending ......');
        io.to(data.trip_id).emit("chatMessage", data.msg);
        getNotificationToken(data.receiverId)
            .then((res) => {
                io.to(res).emit("chatNotification", data);
            })
            .catch(error => console.log(error))
        // io.to(data.riderId).emit("chatNotification", data);
        // io.to(data.trip_id).emit("chatNotification", data);
    })

});

io.on("disconnect", (reason) => {
    console.log('a user idsconnected')
});


//service static files.
app.use(express.static(path.join(__dirname, '/flog-api/')));

//PORT LISTENING
server.listen(process.env.PORT)

module.exports = app