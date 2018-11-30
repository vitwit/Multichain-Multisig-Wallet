const authCtrl = require('../controllers/auth.controller')

module.exports = function (app) {
    app.route('/api/createaccount').get(authCtrl.createAccount)
    app.route('/api/createmultisigaccount').get(authCtrl.createMultiSigAccount)
    app.route('/api/sendasset').post(authCtrl.sendAsset)
    app.route('/api/sendmultisigasset').post(authCtrl.sendMultiSigAsset)
    app.route('/api/signin').post(authCtrl.signIn)
    app.route('/api/signtransaction').post(authCtrl.signTransaction)
    app.route('/api/getpendingtx').post(authCtrl.getPendingTx)
    app.route('/api/profile').post(authCtrl.profile)
    app.route('/api/faucet').post(authCtrl.faucet)
}