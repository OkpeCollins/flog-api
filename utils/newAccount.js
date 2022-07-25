const nodemailer = require("nodemailer");
const ejs = require('ejs');

const confirmPassword = async (email, name, role) => {
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
        ejs.renderFile("./emails/welcome/index.ejs", {
            name: name,
            type: role
        }, function (err2, data) {
            if (err2) {
                console.log(err2)
            } else {
                var mainOptions = {
                    from: '"Flog Support" ' + process.env.EMAIL_ADDRESS,
                    to: email,
                    subject: "Congratulations your account has been created successfully!",
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