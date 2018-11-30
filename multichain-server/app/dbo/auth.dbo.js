var mongoose = require('mongoose'),
    pendingTx = mongoose.model('Pending')


exports.savePendingTx = function(data,next) {
    var newTx = new pendingTx(data)
    console.log('tx',newTx)
    newTx.save()
    next
}

exports.findPendingTx = function(params,next) {
    pendingTx.find(params,next)
}