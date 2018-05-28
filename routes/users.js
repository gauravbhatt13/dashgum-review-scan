var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

/* GET users listing. */
router.post('/contact', function(req, res, next) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'gauravbhatt.info@gmail.com',
            pass: 'Signin@132'
        }
    });

    var mailOptions = {
        from: 'gauravbhatt.info@gmail.com',
        to: 'reviewscan@outlook.com',
        subject: 'Message from Tipdia',
        text: 'Name: ' + req.body.name + '\n Email: ' + req.body.email + '\n Phone: ' + req.body.phone + '\n Message: ' + req.body.message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('message couldnt be sent : ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.send('contact saved');
});

module.exports = router;
