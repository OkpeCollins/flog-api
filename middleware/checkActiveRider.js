const cron = require('node-cron');
const Rider = require('../models/rider');
const OnlineRider = require('../models/onlineRider');
const moment = require("moment");

module.exports = async (req, res, next) => {
    try {

        cron.schedule('*/1 * * * *', async () => {
            // console.log('running a task every minute');
            var getAll = await OnlineRider.find({})
            getAll.forEach(async function (item) {
                if (moment() > item.timeOut) {
                    const result = await OnlineRider.updateOne({
                        riderId: item.riderId
                    }, {
                        $set: {
                            "status": "Inactive"
                        }
                    }, )
                    await Rider.updateOne({
                        _id: item.riderId
                    }, {
                        $set: {
                            "status.trip": "Offline"
                        }
                    }, )
                }
            })
        });

        //Excludes unauth paths
        const exceptPaths = ['/rider-login', '/rider', '/polyline'];
        if (exceptPaths.includes(req.path)) {
            return next();
        }

        //Get and check decode token
        let riderId = req.decoded.riderId

        let countTrip = await OnlineRider.findOne({
            riderId: riderId
        })
        if (countTrip) {
            await OnlineRider.updateOne({
                riderId: riderId
            }, {
                $set: {
                    "timeOut": moment().add(process.env.TIME_OUT_HOUR, 'minutes')
                }
            }, )
        }
        next();

    } catch (e) {
        return res.status(401).json({
            "error": e.message,
            "message": 'Something went wrong.'
        });
    }
}