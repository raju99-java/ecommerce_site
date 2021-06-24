


let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter');

function updateCart(pizza){
    axios.post("/update-cart", pizza).then((res) => {
        cartCounter.innerText = res.data.totalQty;

        new Noty({
            type: "success",
            timeout: 1000,
            text: "Item added to cart",
            progressBar: false
          }).show(); 

    }).catch((err)=>{

        new Noty({
            type: "error",
            timeout: 1000,
            text: "Something went wrong",
            progressBar: false
          }).show();

    })
}

addToCart.forEach((btn)=>{
    btn.addEventListener('click', (e)=>{
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
    })
})


const alertMsg = document.querySelector('#success-alert');
if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove();
    },5000);
}



// admin section

const initAdmin = (socket) =>{
    const adminTable = document.querySelector('#adminTable');
    let orders = [];

    let markup;
    
    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With" : "XMLHttpRequest"
        }
    }).then( (res)=>{
        orders = res.data;
        markup = generateMarkup(orders);
        adminTable.innerHTML = markup;
    }).catch( (err)=>{
        console.log(err);
    });

    function renderItems(items){
        let parsedItems = Object.values(items);
        return parsedItems.map( (menuItem)=>{
            return `
                <p>${menuItem.item.name} - ${menuItem.qty} pcs</p>
            `
        }).join('');
    }

    function generateMarkup(orders){

        return orders.map( (order)=>{
            return `
                <tr>
                     <td class="border px-4 py-2 text-green-900">
                         <p>${order._id}</p>
                         <div> ${renderItems(order.items)} </div>
                     </td>

                     <td class="border px-4 py-2">${order.customerId.name}</td>
                     <td class="border px-4 py-2">${order.phone}</td>
                     <td class="border px-4 py-2">${order.address}</td>
                     <td class="border px-4 py-2">
                            ${ moment(order.createdAt).format('ddd, LL') }
                     </td>
                     <td class="border px-4 py-2">
                            ${ moment(order.createdAt).format('hh:mm A') }
                     </td>
                     
                     <td class="border px-4 py-2">
                        <div class="inline-block relative w-64">
                           
                            <form action="/admin/orders/status" method="POST">

                                 <input type="hidden" name="orderId" value="${order._id}">
                                 <select name="status" onchange="this.form.submit()"
                                      class="block appearance-none w-full bg-white border
                                      border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded
                                      shadow leading-tight focus:outline-none focus:shadow-outline">
                                    
                                    <option value="order_placed"
                                        ${order.status === 'order_placed' ? 'selected': '' }>
                                        Placed</option>
                                    <option value="confirmed"
                                        ${order.status === 'confirmed' ? 'selected': '' }>
                                        Confirmed</option>
                                    <option value="prepared"
                                        ${order.status === 'prepared' ? 'selected': '' }>
                                        Prepared</option>
                                    <option value="delivered"
                                        ${order.status === 'delivered' ? 'selected': '' }>
                                        Delivered</option>
                                    <option value="completed"
                                        ${order.status === 'completed' ? 'selected': '' }>
                                        Completed</option>

                                 </select>
                            </form>
                            <div  class="pointer-events-none absolute inset-y-0 right-0 
                                         flex items-center px-2 text-gray-700">
                               <svg class="fill-current w-4 h-4 mr-2" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M 10,30
                                        A 20,20 0,0,1 50,30
                                        A 20,20 0,0,1 90,30
                                        Q 90,60 50,90
                                        Q 10,60 10,30 z"/>
                               </svg>
                               
                            </div>
                        </div>
                     </td>

                     <td class="border px-4 py-2">
                     ${order.paymentType}
                     </td>

                     <td class="border px-4 py-2">
                     ${order.paymentStatus ? 'Paid' : 'Due'}
                     </td>

                     <td class="border px-4 py-2">
                            ${ moment(order.updatedAt).format('ddd, LL, hh:mm A') }
                     </td>

                </tr>
            `
        }).join('');

    }


    socket.on('orderPlaced', (order)=>{
        new Noty({
            type: "success",
            timeout: 1000,
            text: "New Order !",
            progressBar: false,
          }).show();

          orders.unshift(order);
          adminTable.innerHTML = '';
          adminTable.innerHTML = generateMarkup(orders);
    })

}



//change order status
let statusLine = document.querySelectorAll('.status_line');
let input = document.querySelector('#changeStatus');
let order = input ? input.value : null;
order = JSON.parse(order);

//console.log(order);
let time = document.createElement('small');


function updateStatus(order){

    statusLine.forEach( (status)=>{
        status.classList.remove('step-completed');
        status.classList.remove('current');
    });

    let stateChange = true;

    statusLine.forEach( (status)=>{
         let data = status.dataset.status;
         if(stateChange){
             status.classList.add('step-completed');
         }
         if(data === order.status){
             stateChange = false;
             time.innerText = moment(order.updatedAt).format('ddd, LL, hh:mm A');
             status.appendChild(time);
             if(status.nextElementSibling){
             status.nextElementSibling.classList.add('current');
             }
         }
    })

}


updateStatus(order);

//stripe payment gateway

 function paymentCall(formObject){
    axios.post('/order', formObject).then( (res)=>{
        new Noty({
            type: "success",
            timeout: 1000,
            text: res.data.message,
            progressBar: false,
          }).show();

          setTimeout(()=>{
            window.location.href = '/customers/orders';
          },1000)
          

    }).catch( (err)=>{
        new Noty({
            type: "error",
            timeout: 1000,
            text: err.res.data.message,
            progressBar: false,
          }).show();
    })
 }

 function initStripe(){

    const stripe = Stripe('pk_test_51J44JvSGHGeEnAkP3XTh37UUn4eimMV5BnDcQxN6yuPS0WqBMW5Oa2N0mzTM9u3N4GpTPqIzPjsi1ibX9vRMnd3c00EGO8JDkh');
    let card = null;

    function mountWidget(){

        const elements = stripe.elements();

    let style = {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing : 'antialiased',
            fontSize : '16px',
            '::placeholder' : {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

     card = elements.create('card', {style, hidePostalCode: true});

    card.mount('#card-element');

    }

//get payment type
const paymentType = document.querySelector('#paymentType');

if(!paymentType){
    return;
}
paymentType.addEventListener('change', (e)=>{
    console.log(e.target.value)
    if(e.target.value === 'card'){
        //display card widget
        mountWidget();
    }else{
        //not display card widget
        card.destroy();
    }
})

//Ajax call from cart order page
const paymentForm = document.querySelector('#payment-form');
if(paymentForm){

    paymentForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        let formData = new FormData(paymentForm); 
        let formObject = {};
    
        for(let [key, value] of formData.entries()){
            formObject[key] = value;
        }

        
        if(!card){
            //ajax call
            paymentCall(formObject);
            return;

        }
            
        // verify card
            stripe.createToken(card).then( (result)=>{
                formObject.stripeToken = result.token.id;
                paymentCall(formObject);
            }).catch( (err)=>{
                console.log(err)
            });
        

        
    })

}

}

initStripe();


//socket 

let socket = io();

initAdmin(socket);
//join
if(order){
    socket.emit('joinEvent', `order_${order._id}`);
}

let adminPath = window.location.pathname;
//console.log(adminPath);
if(adminPath.includes('admin')){
    socket.emit('joinEvent', 'adminRoom');
}

// listen
socket.on('orderUpdated', (data)=>{
    const updatedOrder = {...order};
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;

    updateStatus(updatedOrder);
    new Noty({
        type: "success",
        timeout: 1000,
        text: "Status Updated",
        progressBar: false,
      }).show();
})

