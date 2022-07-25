const Admin = require('../models/admin')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require("mongoose");

try {
    // you can refer any other flow to get count or number of record
    Admin.countDocuments({}, function(err, count) {

        console.log("Number of Admin:", count);

        // decide ur other logic

        // if count is 0 or less
        if (count <= 0) {

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash('Admin@123', salt, function(err, hash) {
                    if (err) {
                        res.status(403).json({
                            message: err
                        })
                    } else {
                        admin = new Admin({
                            _id: new mongoose.Types.ObjectId(),
                            name: 'Admin',
                            mobile: '+2348067353656',
                            email: 'Admin@gmail.com',
                            password: { salt: salt, hash: hash },
                        })
                        admin.save()
                    }
                })
            })
        }

    })
} catch (error) {

}