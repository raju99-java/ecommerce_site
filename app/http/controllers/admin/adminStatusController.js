const Order = require("../../../models/order");

const adminStatusController = ()=>{
      return {

        adminOrderStatus(req, res){

            const {orderId,status} = req.body;
            Order.updateOne({_id: orderId}, {status: status}, (err, data)=>{
                if(err){
                    return res.redirect('/admin/orders');
                }  
                // emit event
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderUpdated', {id: orderId, status: status});
                
                return res.redirect('/admin/orders');
            });

        }

      }
}

module.exports = adminStatusController;