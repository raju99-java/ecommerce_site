//Controllers
const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customersControllers/cartController");
const orderController = require("../app/http/controllers/customersControllers/orderController");
const adminOrderController = require("../app/http/controllers/admin/adminOrderController");
const adminStatusController = require("../app/http/controllers/admin/adminStatusController");

//Middlewares
const auth = require("../app/http/middlewares/auth");
const notRoute = require("../app/http/middlewares/notRoute");
const admin = require("../app/http/middlewares/admin");

const routes = (app) =>{

    app.get('/', homeController().index);

    
    app.get("/login", notRoute, authController().login);
    app.post("/login", authController().postLogin);
    
    app.get("/register", notRoute, authController().register);
    app.post("/register", authController().postRegister);

    app.post("/logout", authController().postLogout);

    app.get("/cart", cartController().cart);
    app.post("/update-cart", cartController().update); 

    //Customer routes
    app.post("/order", auth, orderController().postOrder);
    
    app.get("/customers/orders", auth, orderController().orderIndex);

    app.get("/customers/orders/:id", auth, orderController().singleOrderIndex);

    
    //Admin routes
    app.get("/admin/orders", admin, adminOrderController().adminOrderIndex);
    
    app.post("/admin/orders/status", admin, adminStatusController().adminOrderStatus);

    
}

module.exports = routes;