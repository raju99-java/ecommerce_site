const User = require("../../models/user");
//const bcrypt = require('bcrypt');

const passport = require('passport');

const authController = () =>{

    const _getRedirectUrl = (req) =>{
        return req.user.role === 'admin' ? '/admin/orders' : '/customers/orders';
    }

    return {

//------------------------------------------------
        register(req, res){
            res.render('auth/register');
        },
//------------------------------------------------
        async postRegister(req, res){
            try{
                  const {name, email, password, cpassword} = req.body;

                  //validate request
                  if(!name || !email || !password || !cpassword){
                    req.flash('error', 'All fields are required !');
                    return res.redirect('/register');
                  }

                  //check pass & cpass same or not
                  if(password === cpassword){
                    const users = new User({
                        name : name,
                        email : email,
                        password : password,
                        //confirmpassword : cpassword
                    });

                    // password hash (secure) using middleware check model file
                    
                    /*/generate token using middleware jwt
                    //const token = await users.generateToken();

                    //save the token to the cookie
                    res.cookie("jwt", token, {
                        expires: new Date(Date.now() + 30*24*60*60*1000), // 30 days
                        httpOnly: true
                    });*/

                    // save data
                    const user =  await users.save();
                    return res.redirect('/login');
                  }
                  else{
                    req.flash('error', 'password not matching !');
                    return res.redirect('/register');
                  }
            
            }catch(error){
                req.flash('error', 'Email already exist !');
                return res.redirect("/register");
            }

        },

//------------------------------------------------
        login(req, res){
            res.render('auth/login');
        },
//------------------------------------------------
        postLogin(req, res, next){

            const {email, password} = req.body;

            //validate request
            if(!email || !password){
                req.flash('error', 'All fields are required !');
                return res.redirect('/login');
            }

            passport.authenticate('local', (err, user, info) =>{
                //console.log(user.email);
                if(err){
                    req.flash('error', info.message);
                    return next(err);
                }
                if(!user){
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }
                req.login(user, (err)=>{
                    if(err){
                        req.flash('error', info.message);
                        return next(err);
                    }
                    
                    return res.redirect(_getRedirectUrl(req));
                })
            })(req, res, next);

        },
            /*try{
            const {email, password} = req.body;
            
            const user = await User.findOne({email});
            const isMatch = await bcrypt.compare(password, user.password);

            //generate token using middleware jwt
            const token = await user.generateToken();

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30*24*60*60*1000), // 30 days
                httpOnly: true,
               // secure: true
            });

            

            if(isMatch){
                return res.redirect("/");
            }else{
                req.flash('error', 'Invalid Login Details !');
                return res.redirect("/login");
            }
    
        }catch(error){
            req.flash('error', 'Invalid Login Details !');
            return res.redirect("/login");
        }*/

        
//------------------------------------------------    
        postLogout(req, res){
            req.logout();
            return res.redirect('/login');
        }

//------------------------------------------------
    }
}

module.exports = authController;