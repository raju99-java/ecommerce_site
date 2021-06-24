const Order = require("../../../models/order");

const adminOrderController = () =>{
    return {

        adminOrderIndex(req, res){
            Order.find({status: {$ne: 'completed'}}, null, {sort: {'createdAt': -1}}).
            populate('customerId', '-password').exec( (err, orders)=>{
               
                if(req.xhr){
                    return res.json(orders);
                }
                return res.render('admin/orders');
            })

        }
    }
}

module.exports = adminOrderController;