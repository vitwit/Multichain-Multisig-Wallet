const chalk = require('chalk');
const mongoose  = require('mongoose')
const env = require('./config/env/test')


mongoose.connect('mongodb://'+env.db.host+'/'+env.db.database);

var db = mongoose.connection;

db.on('error',() => {
    console.log(chalk.red('error while connecting database'))
})

db.on('open',() => {
    console.log(chalk.green('database connected'))
})

var PORT = process.env.PORT || 5000

var app = require('./config/express')(db)

app.listen(PORT,() => {
    console.log(chalk.blue('server is running '+ PORT))
})