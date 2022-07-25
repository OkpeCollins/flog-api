const Settings = require('../models/settings');
const mongoose = require("mongoose");

try {

    // you can refer any other flow to get count or number of record
    Settings.countDocuments({}, function(err, count) {

        if (err) {
            console.log(err)
        } else {
            console.log("Number of Settings:", count);
            // if count is 0 or less
            if (count <= 0) {
                var user = {
                    name: "Admin User",
                    email: "admin@gmail.com",
                    password: "admin"

                }
                settings = new Settings({
                    twilio: { ACCOUNTSID: "AC5bf5f081861d295c36dd9d9ae0a1b", SERVICE_SID: "VA55eed7f9482f2fc584ac13d5ccce", AUTHTOKEN: "371223d1960a1717d1e54263a82c", CHANNEL: "sms" },
                    googgleMap: { API: "AIzaSyBXXf0i8S04T-O_ev3eIzRgS9Me2ao" },
                    trip: { pricePerKilometer: "200", fixedPrice: "800" },
                    payment: { publicKey: "FLWPUBK_TEST-2a155d1d823b4a71d5d09a900e4-X", secretKey: "FLWSECK_TEST-1973c890bd8d19cb7952f8604d0-X", encryptionKey: "FLWSTEST5841ad17ec37", currency: "NGN" },
                    account: { name: "Flog", number: "02869098918", bank: "GTBank" },
                    id: 1
                });

                settings.save();
            }
        }

    })
} catch (error) {
    console.log(error)

}