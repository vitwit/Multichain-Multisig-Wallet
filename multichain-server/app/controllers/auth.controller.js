let multichain1 = require("multichain-node")({
    port: 2772,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "8H3zaHCrRjkXHdc4k4dNfJiMAKsrA5XmBox4PyRejpn6"
});
let multichain2 = require("multichain-node")({
    port:  2772,
    host: "192.168.1.68",
    user: "multichainrpc",
    pass: "8WQqduMmGYiAPybx5Dqes97d7bsV5CRK3kgTpoEiDmXa"
})

let waterfall = require('async-waterfall');

var authDbo = require('../dbo/auth.dbo')


exports.createAccount  = function(req,res)  {
    multichain1.createKeyPairs((err,pairs)=>{
        multichain1.importPrivKey({privkey:pairs[0].privkey,rescan:false},(err,add)=>{
            console.log(add)
        })

        multichain1.grant({addresses:pairs[0].address,permissions:'receive,send'},(err,grant)=>{
            console.log(grant)
        })

        res.status(200).json({
            status:"OK",
            message:'Successfully created wallet',
            walletData:pairs[0]
        })
    })
}

exports.createMultiSigAccount  = function(req,res) {
    var firstwallet
    var secondwallet
    var multiaccount
    waterfall([
        function(callback) {
            multichain1.createKeyPairs((err,pairs)=>{
                console.log('created key pair')
                multichain1.importPrivKey({privkey:pairs[0].privkey,rescan:false},(err,add)=>{
                    console.log('multichain1 imported priv key',err)
                })
    
                multichain1.grant({addresses:pairs[0].address,permissions:'receive,send'},(err,grant)=>{
                    console.log('multichain1 granted permission ',err)
                })

                firstwallet = pairs[0]

                console.log('first wallet',firstwallet)

                callback()
            })
        },
        function(callback) {
            multichain2.createKeyPairs((err,pairs)=>{

                multichain2.importPrivKey({privkey:pairs[0].privkey,rescan:false},(err,add)=>{
                    console.log('multichain1 imported priv key',err)
                })
    
                multichain1.grant({addresses:pairs[0].address,permissions:'receive,send'},(err,grant)=>{
                    console.log('multichain1 granted permission ',err)
                })

                secondwallet = pairs[0]
                console.log('second wallet',secondwallet)
                callback()
            })
        },
        function(callback) {

            multichain1.addMultiSigAddress({nrequired:2,keys:[firstwallet.pubkey,secondwallet.pubkey]},(err,multiresp)=>{
                multiaccount = multiresp
                console.log('multichain1 added multisig wallet ',multiresp)
                multichain2.addMultiSigAddress({nrequired:2,keys:[firstwallet.pubkey,secondwallet.pubkey]},(err,multiresp)=>{
                    console.log('multichain2 added multisig wallet ',multiresp)
                    callback()
                });
                
            })
            
            
        },
        function(callback) {

            multichain1.grant({addresses:multiaccount,permissions:'receive,send'},(err,grant)=>{
                console.log('multichain1 granted permission ',multiaccount)
                callback()
            })
        }

    ],function(err,result){
        res.status(200).json({
            status:'Ok',
            firstwallet:firstwallet,
            secondwallet:secondwallet,
            multiaccount:multiaccount
        })
    })
}

exports.sendAsset = function(req,res) {
    var params = req.body
    var toAddress = req.body.toAddress
    var chain = req.body.chain
    if(chain == 'multichain1') {
        multichain1.createRawSendFrom({from:String(params.fromAddess),amounts:{[toAddress]:{Rupee:params.amount}}},(err,createresp)=>{
            if(createresp == undefined) {
                console.log(err)
                res.status(200).json({
                    success:false,
                    status:"OK",
                    message:'In efficient Funds in your wallet',
                    err:err
                })
            }
            else {
                multichain1.signRawTransaction({hexstring:createresp,parents:[],privatekeys:[params.privKey]},(err,signresp)=>{
                    if(signresp == undefined) {
                        res.status(200).json({
                            success:false,
                            status:"OK",
                            message:'Entered wrong private key',
                            err:err
                        })
                    }
                    else {
                        console.log(signresp)
                        multichain1.sendRawTransaction({hexstring:signresp.hex},(err,sendresp)=>{
                            res.status(200).json({
                                success:true,
                                status:"OK",
                                message:'Successfully sent asset',
                                transactionid:sendresp
                            })
                        })
                    }
                })
            }
        })
    }
    else {
        multichain2.createRawSendFrom({from:String(params.fromAddess),amounts:{[toAddress]:{Rupee:params.amount}}},(err,createresp)=>{
            if(createresp == undefined) {
                console.log(err)
                res.status(200).json({
                    success:false,
                    status:"OK",
                    message:'In efficient Funds in your wallet',
                    err:err
                })
            }
            else {
                multichain2.signRawTransaction({hexstring:createresp,parents:[],privatekeys:[params.privKey]},(err,signresp)=>{
                    if(signresp == undefined) {
                        res.status(200).json({
                            success:false,
                            status:"OK",
                            message:'Entered wrong private key',
                            err:err
                        })
                    }
                    else {
                        console.log(signresp)
                        multichain2.sendRawTransaction({hexstring:signresp.hex},(err,sendresp)=>{
                            res.status(200).json({
                                success:true,
                                status:"OK",
                                message:'Successfully sent asset',
                                transactionid:sendresp
                            })
                        })
                    }
                })
            }
        })
    }
    
}


exports.signIn = function(req,res) {
    
        var address1 = req.body.address;
        var arr = [];
        var hasMulti = false;
        var isValid =false;
        var belongsTo ;
        console.log(req.body)
        waterfall([
            function(callback) {
                multichain1.validateAddress({address:address1},(req,res)=>{
                    
                    if(res.isvalid&&res.ismine) {
                        belongsTo = 'multichain1';
                        isValid = true
                        callback(null,'multichain1',true);
                    }
                    else {
                        multichain2.validateAddress({address:address1},(req,res)=>{
                            if(res.isvalid ) {
                                belongsTo = 'multichain2';
                                isValid = true
                                callback(null,'multichain2',true);
                            }
                            else {
                                isValid = false
                                callback(null,null,false);
                            }
                        })
                    }
                })
            },
            function(belongs,isValid,callback) {
                console.log('came',belongs,isValid)
                if(isValid) {
                    if(belongs == 'multichain1') {
                        multichain1.getAddresses({verbose:true},(req,res)=> {
                            res.map((eachaddress)=>{
                                    if(eachaddress.addresses) {
                                        console.log('addressses',eachaddress.addresses)
                                        eachaddress.addresses.map((addr)=>{
                                            console.log('lag',addr)
                                            if(addr == address1) {
                                                hasMulti = true
                                                console.log('pushing',eachaddress.address)
                                                arr.push(eachaddress.address)
        
                                            }
                                            
                                        })
                                    }     
                            })
                            callback()
                    
                        })
                    }
                    else {
                        multichain2.getAddresses({verbose:true},(req,res)=> {
                            // console.log('resq',res)
                            res.map((eachaddress)=>{
                                    if(eachaddress.addresses) {
                                        console.log('addressses',eachaddress.addresses)
                                        eachaddress.addresses.map((addr)=>{
                                            console.log('lag',addr)
                                            if(addr == address1) {
                                                // console.log('came',eachaddress.address)
                                                // arr.push(1)
                                                // console.log(arr)
                                                hasMulti = true
                                                console.log('pushing',eachaddress.address)
                                                arr.push(eachaddress.address)
        
                                            }
                                            
                                        })
                                    }     
                            })
                            callback()
                    
                        })
                    }
                    
                }
                else {
                    callback()
                }
            },
            function(callback) {
                console.log('arr',arr)
                callback(null,arr)
            },
            
        ],function(err,result) {
                 res.status(200).json({
                     status:'Ok',
                     isvalid: isValid,
                     hasMulti: hasMulti,
                     belongsTo:belongsTo,
                     multiAddresses : arr
                 })
        })   
}

exports.sendMultiSigAsset = function(req,res) {
    var params = req.body
    console.log(params)
    var toAddress = params.toAddress
    var fromAddress = params.fromAddress
    if(req.body.node == 'multichain1') {
        multichain1.createRawSendFrom({from:String(params.refferAddress),amounts:{[toAddress]:{Rupee:params.amount}}},(err,createresp)=>{
            if(createresp == undefined) {
                res.status(200).json({
                    status:"OK",
                    success:false,
                    message:'In efficient Funds in your wallet',
                    err:err
                })
            }
            else {
                multichain1.signRawTransaction({hexstring:createresp,parents:[],privatekeys:[params.privKey]},(err,signresp)=>{
                    if(signresp == undefined) {
                        res.status(200).json({
                            status:"OK",
                            success:false,
                            message:'Entered wrong private key',
                            err:err
                        })
                    }
                    else {
                        multichain1.createRawSendFrom({from:fromAddress,action:"sign",amounts:{[toAddress]:{Rupee:params.amount}}},(err,mulsendresp)=>{
                            if(mulsendresp == undefined) {
                                res.status(200).json({
                                    status:"OK",
                                    message:'In efficient Funds in your wallet',
                                    success:false,
                                    err:err
                                })
                            }
                            else {
                                multichain1.validateAddress({address:params.fromAddress},(req,res) => {
                                    if(res.isvalid ) {
                                        var pendingAddress
                                        res.addresses.map((addr)=>{
                                            if(addr != params.refferAddress) {
                                                pendingAddress = addr
                                            }
                                        })
                                        params = {
                                            "address":pendingAddress,
                                            "data":mulsendresp
                                        }
                                        authDbo.savePendingTx(params)
                                    }
                                })

                                
                                res.status(200).json({
                                    success:true,
                                    status:"Ok",
                                    message:"waiting other address to approve",
                                    data:mulsendresp
                                })
                            }
                        
                        })
                    }
                })
            }
        })
    }
    else {
        multichain2.createRawSendFrom({from:String(params.refferAddress),amounts:{[toAddress]:{Rupee:params.amount}}},(err,createresp)=>{
            if(createresp == undefined) {
                res.status(200).json({
                    status:"OK",
                    message:'In efficient Funds in your wallet',
                    success:false,
                    err:err
                })
            }
            else {
                multichain2.signRawTransaction({hexstring:createresp,parents:[],privatekeys:[params.privKey]},(err,signresp)=>{
                    if(signresp == undefined) {
                        res.status(200).json({
                            status:"OK",
                            message:'Entered wrong private key',
                            success:false,
                            err:err
                        })
                    }
                    else {
                        
                        multichain2.createRawSendFrom({from:fromAddress,action:"sign",amounts:{[toAddress]:{Rupee:params.amount}}},(err,mulsendresp)=>{
                            if(mulsendresp == undefined) {
                                res.status(200).json({
                                    status:"OK",
                                    message:'In efficient Funds in your wallet',
                                    success:false,
                                    err:err
                                })
                            }
                            else {
                                res.status(200).json({
                                    status:"Ok",
                                    message:"waiting other address to approve",
                                    success:true,
                                    data:mulsendresp
                                })
                            }
                        
                        })
                    }
                })
            }
        })
    }
}


exports.signTransaction = function(req,res) {
    var params  = req.body
    if(params.node == 'multichain1') {

        multichain1.createRawSendFrom({from:params.address,amounts:{[params.address]:{Rupee:params.amount}}},(err,createresp)=>{
            if(createresp == undefined) {
                res.status(200).json({
                    status:"OK",
                    message:'In efficient Funds in your wallet',
                    success:false,
                    err:err
                })
            }
            else {
                multichain1.signRawTransaction({hexstring:createresp,parents:[],privatekeys:[params.privKey]},(err,signresp)=>{
                    if(signresp == undefined) {
                        res.status(200).json({
                            status:"OK",
                            message:'Entered wrong private key',
                            err:err
                        })
                    }
                    else {
                        multichain1.signRawTransaction({hexstring:params.hex},(err,signresp)=>{
                            console.log(signresp)
                            if(signresp == undefined) {
                                console.log(err)
                                res.status(200).json({
                                    status:"OK",
                                    message:'Entered wrong private key',
                                    success:false,
                                })
                            }
                            else {
                                multichain1.sendRawTransaction({hexstring:signresp.hex},(err,sendrep)=>{
                                    console.log('this is',err,sendrep)
                                    res.status(200).json({
                                        status:"Ok",
                                        message:"Sent",
                                        success:true,
                                        data:sendrep
                                    })
                                 })
                            }
                        })
                    }
                })
            }
        })
    }
    else {

        multichain2.createRawSendFrom({from:params.address,amounts:{[params.address]:{Rupee:params.amount}}},(err,createresp)=>{
            if(createresp == undefined) {
                res.status(200).json({
                    status:"OK",
                    success:false,
                    message:'In efficient Funds in your wallet',
                    err:err
                })
            }
            else {
                multichain2.signRawTransaction({hexstring:createresp,parents:[],privatekeys:[params.privKey]},(err,signresp)=>{
                    if(signresp == undefined) {
                        res.status(200).json({
                            status:"OK",
                            success:false,
                            message:'Entered wrong private key',
                            err:err
                        })
                    }
                    else {
                        multichain2.signRawTransaction({hexstring:params.hex},(err,signresp)=>{
                            console.log(signresp)
                            if(signresp == undefined) {
                                console.log(err)
                                res.status(200).json({
                                    status:"OK",
                                    success:false,
                                    message:'Entered wrong private key',
                                })
                            }
                            else {
                                multichain2.sendRawTransaction({hexstring:signresp.hex},(err,sendrep)=>{
                                    console.log('this is',err,sendrep)
                                    res.status(200).json({
                                        status:"Ok",
                                        message:"Sent",
                                        success:true,
                                        err:err,
                                        data:sendrep
                                    })
                                 })
                            }
                        })
                    }
                })
            }
        })
    }
}

exports.getPendingTx = function(req,res)  {
    var query = {
        "address":req.body.address
    }
    authDbo.findPendingTx(query,function(err,result) {
        console.log(result,err)
    })
}


exports.profile = function(req,res) {
    var address  = req.body.address
    var chain = req.body.chain
    if(chain == 'multichain1') {
        multichain1.getAddressBalances({address:address},(err,resp)=>{
            console.log(resp)
            res.status(200).json({
                status:"Ok",
                data:resp
            })
        })
    }
    else {
        multichain2.getAddressBalances({address:address},(err,resp)=>{
            console.log(resp)
            res.status(200).json({
                status:"Ok",
                data:resp
            })
        })
    }
}

exports.faucet = function(req,res) {

    var toAddress = req.body.toAddress
    

    multichain1.createRawSendFrom({from:"15UcyARFwi541b4UTpuqVgPSgdyFxTmtGBFkRA",amounts:{[toAddress]:{Rupee:100}}},(err,createresp)=>{
        if(createresp == undefined) {
            console.log(err)
            res.status(200).json({
                success:false,
                status:"OK",
                message:'In efficient Funds in your wallet',
                err:err
            })
        }
        else {
            multichain1.signRawTransaction({hexstring:createresp,parents:[],privatekeys:["VAjsdf22ER1WpLbzEmFn5dXCXhc9UYKFF8u1SnA4X4QSEXyM2NiHLT6c"]},(err,signresp)=>{
                if(signresp == undefined) {
                    res.status(200).json({
                        success:false,
                        status:"OK",
                        message:'Entered wrong private key',
                        err:err
                    })
                }
                else {
                    console.log(signresp)
                    multichain1.sendRawTransaction({hexstring:signresp.hex},(err,sendresp)=>{
                        res.status(200).json({
                            success:true,
                            status:"OK",
                            message:'Successfully sent asset',
                            transactionid:sendresp
                        })
                    })
                }
            })
        }
    })

}