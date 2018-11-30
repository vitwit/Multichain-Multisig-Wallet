import Home from "../views/home"
import CreateWallet from "../views/createwallet"
// import Home from '../views/home'
let appRoutes = []

appRoutes = [
    {
        path:"/",
        component: "as"
    },
    {
        path:"/login",
        component: "login"
    },
    {
        path:"/info",
        component:Home
    },
    {
        path:"/send",
        component:"send"
    },
    {
        path:"/createwallet",
        component:CreateWallet
    }
    
]

export default appRoutes;