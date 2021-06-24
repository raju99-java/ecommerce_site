require('dotenv').config();
const Order = require("../../../models/order");
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const orderController = () =>{
    return {

        postOrder(req, res){

            const {phone, address, stripeToken, paymentType} = req.body;
            //Validate request
            if(!phone || !address){
                return res.json({'message': 'All fields are required !'});
            }

            const order = new Order({
                customerId : req.user._id,
                items : req.session.cart.items,
                phone : phone,
                address : address
            });

            order.save().then( (result)=>{

                Order.populate(result, {path: 'customerId'}, (err, placedOrder)=>{
                   
                    // Stripe payment
                    if(paymentType === 'card'){

                        stripe.charges.create({
                            amount : req.session.cart.totalPrice * 100,
                            source : stripeToken,
                            currency: 'inr',
                            description : `Pizza order : ${placedOrder._id}`
                        }).then( ()=>{

                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            
                            placedOrder.save().then((ord)=>{
                                //emit event
                                const eventEmitter = req.app.get('eventEmitter');
                                 eventEmitter.emit('orderPlaced', ord);
                                 // do the cart is empty
                                  delete req.session.cart;
                                 return res.json({message: 'Payment Successfull, Order Placed Successfully...'});
                            
                                }).catch( (err)=>{
                                console.log(err);
                            })

                        }).catch( (err)=>{
                            // do the cart is empty
                            delete req.session.cart;
                            return res.json({message: 'Order Placed, But Payment Failed !, You can payment COD'});
                        })
                    }
                     //cod type payment
                    else{

                    //cod type payment
                         placedOrder.paymentType = paymentType;
                            
                            placedOrder.save().then((ord)=>{
                                //emit event
                                const eventEmitter = req.app.get('eventEmitter');
                                 eventEmitter.emit('orderPlaced', ord);
                                 // do the cart is empty
                                  delete req.session.cart;
                                 return res.json({message: 'Order Placed Successfully...'});
                            
                                }).catch( (err)=>{
                                console.log(err);
                            })

                        }

                });

               // console.log(result);
               
            }).catch( (err)=>{
                return res.status(500).json({message: 'Something went Wrong !'});
            })

        },

        async orderIndex(req, res){
            const fetchOrder = await Order.find( {customerId : req.user._id},null,
                                                 {sort: {'createdAt': -1}});
            //console.log(fetchOrder);
            //clean chache
            res.setHeader('Cache-Control', 'no-cache');

            res.render('customers/orders', {orders : fetchOrder, moment : moment});
        },

        async singleOrderIndex(req, res){

            const order = await Order.findById(req.params.id);
            //authorized user
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customers/singleOrder', {order: order});
            }
            return res.redirect('/');

        }

    }
}

module.exports = orderController;