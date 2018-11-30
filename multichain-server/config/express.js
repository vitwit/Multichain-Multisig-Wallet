const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')


module.exports = function(db) {

    var app = express()

    var corsOptions = {
        'origin': '*',
        'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'preflightContinue': false
    };

    app.use(bodyParser.urlencoded({extended:true}))

    app.use(bodyParser.json())

    app.use(morgan('dev'))

    app.use(cors(corsOptions))

    app.use((req,res,next)=> {
        res.setHeader('Access-Control-Allow-Origin','*')
        res.setHeader('Access-Control-Allow-Methods','GET,PUT,POST,DELTE,OPTIONS')
        res.setHeader('Access-Control-Allow-Credentials',true)
        next()
    })

    app.get('/',(req,res)=>{
        res.status(200).json({
            status:'Running'
        })
    })

    require('../app/models/pending.model')
    require('../app/routes/auth.routes')(app)
    
    
    return app
}

