var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var txSchema = new Schema({
   address:{
       type:String
   },
   data:{
       hex:{
           type:String
       },
       complete:{
           type:Boolean
       }

   }
})

module.exports = mongoose.model('Pending',txSchema);