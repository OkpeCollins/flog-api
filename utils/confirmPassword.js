const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.SECRET
const ejs = require('ejs');

const confirmPassword = async (email, name) => {
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
        ejs.renderFile("./emails/reset-password/confirm.ejs", {
            name: name,
        }, function (err2, data) {
            if (err2) {
                return false
            } else {
                var mainOptions = {
                    from: '"Flog Support" ' + process.env.EMAIL_ADDRESS,
                    to: email,
                    subject: "Password Reset Successfully",
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

module.exports = confirmPassword;