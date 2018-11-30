exports.multichain1 = require("multichain-node")({
    port: 2772,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "8H3zaHCrRjkXHdc4k4dNfJiMAKsrA5XmBox4PyRejpn6"
});
exports.multichain2 = require("multichain-node")({
    port:  2772,
    host: "192.168.1.68",
    user: "multichainrpc",
    pass: "8WQqduMmGYiAPybx5Dqes97d7bsV5CRK3kgTpoEiDmXa"
})