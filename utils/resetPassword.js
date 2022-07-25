const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.SECRET
const ejs = require('ejs');

const resetPassword = async (email, id, name, role) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        var token = jwt.sign({
            id: id,
            role: role
        }, jwt_secret, {
            expiresIn: 3600 // 1 hour
        });
        var link = process.env.BASE_URL + "/reset-password/" + token
        ejs.renderFile("./emails/reset-password/html.ejs", {
            name: name,
            link: link
        }, function (err2, data) {
            if (err2) {
                return false
            } else {
                var mainOptions = {
                    from: '"Flog Support" ' + process.env.EMAIL_ADDRESS,
                    to: email,
                    subject: "Reset Your Password",
                    html: data
                };
                transporter.sendMail(mainOptions, function (err, mes) {
                    if (err) {
                        return false
                    } else {
                        return true
                    }
                });
            }
        });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = resetPassword;