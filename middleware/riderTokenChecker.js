const jwt = require('jsonwebtoken')
const Rider = require('../models/rider');
const storeToken = require('../models/jwtToken');

module.exports = (req, res, next) => {
    try {
        const exceptPaths = ['/rider-login', '/rider', '/polyline'];
        if (exceptPaths.includes(req.path)) {
            return next();
        }
        let token = req.get("authorization")
        // decode token
        if (token) {
            token = token.slice(7);
            // verifies secret and checks exp
            jwt.verify(token, process.env.TOKEN_SECRETE, async function (err, decoded) {
                if (err) {
                    return res.status(401).json({
                        "error": err,
                        "message": 'Unauthorized access.'
                    });
                }
                
                var checkToken = await storeToken.findOne({
                    token: token
                })
                if (!checkToken) {
                    return res.status(401).json({
                        "error": "token expired",
                        "message": 'Unauthorized access.'
                    });
                }
                
                req.decoded = decoded

                let rider = await Rider.findOne({
                    "email.value":  req.decoded.email
                })
                switch (rider.status.account) {
                    case "Pending":
                        res.status(400).json({
                            message: "Rider account is not yet Approved"
                        })
                        break;
                    case "Blocked":
                        res.status(400).json({
                            message: "Rider account has been Blocked"
                        })
                        break
                    case "Deleted":
                        res.status(400).json({
                            message: "Rider account has been Deleted"
                        })
                        break
                    case "Approved":
                        next();
                        break
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                "error": true,
                "message": 'No token provided.'
            });
        }
    } catch (e) {
        return res.status(401).json({
            "error": e.message,
            "message": 'Something went wrong.'
        });
    }
}