const nodemailer = require("nodemailer");
const ejs = require('ejs');

const confirmPassword = async (email, name, subject) => {
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


        ejs.renderFile("./emails/account/status.ejs", {
            name: name,
            type: subject
        }, function (err2, data) {
            if (err2) {
                console.log(err2)
            } else {
                var mainOptions = {
                    from: '"Flog Support" ' + process.env.EMAIL_ADDRESS,
                    to: email,
                    subject: "Account " + subject,
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