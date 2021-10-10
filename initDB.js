const mongoose = require('mongoose');
module.exports = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(res => {
        console.log('mongodb conncet...')
    }).catch(err => {
        console.log(err.message)
    });

    mongoose.connection.on('connected', () => {
        console.log('mongodb conncet to db');
    })
    mongoose.connection.on('error', (error) => {
        console.log(error.message);
    })

    mongoose.connection.on('disconnectte', () => {
        console.log('mongodb connetion it disconnectte');
    })

    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('mongoose connection is disconneted due to app');
        });
        process.exit(0);
    })
}