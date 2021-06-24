//require('dotenv').config();

const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name : {
        type: String,
        required : true
    },
    email : {
        type: String,
        required : true,
        unique : true
    },
    password : {
        type: String,
        required : true
    },
   /* confirmpassword : {
        type: String,
        required : true
    },*/
    role : {
        type: String,
        default: 'customer'
    }/*,
    tokens : [{
        token : {
            type: String,
            required : true
        }
    }]*/

},{timestamps: true} );

/*/ Generate token
userSchema.methods.generateToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()}, process.env.TOKEN_SECRET_KEY);
        this.tokens = this.tokens.concat({token});
        await this.save();
        return token;
    }catch(error){
        res.send(`The error part : ${error}`);
    }
}*/

// Password Hash
userSchema.pre("save", async function(next){

    if(this.isModified("password")){

        this.password = await bcrypt.hash(this.password, 10);
        
       // this.confirmpassword = await bcrypt.hash(this.password, 10);
        }

    next();
});

// create collection
const User = new mongoose.model("User",userSchema);

module.exports = User;