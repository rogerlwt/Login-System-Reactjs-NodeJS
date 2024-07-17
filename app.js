const frontend_URL="http://localhost:3000";

const bcrypt=require("bcrypt");
const url=require("url");

//-----Using ExpressJS-----
const express=require("express");
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//-------------------------

const cors=require("cors");
const cors_setting={
    credentials: true, 
    origin: frontend_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(cors_setting));

function res_cors_header(res){
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
}

//-----Cookie Setting-----
const cookieParser=require("cookie-parser");
const cookieEncrypter=require("cookie-encrypter");
const secretKey="12345678901234567890123456789012";
 
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));

const cookie_setting={
    httpOnly: true,
    signed: true,
    maxAge: 1000*60*60*24,
    secure: true,
};
//----------------------------

//-----Use the SQLite3-----
const sqlite3=require("sqlite3").verbose();
const db=new sqlite3.Database("./db/users.db", sqlite3.OPEN_READWRITE, (err)=>{
    if (err) return console.log(err.message);
})
//-------------------------

//-----Define the SqLite Tables-----
const user_type={admin:0, normal:1, };

const table_users_create="CREATE TABLE if not exists users (user_id INTEGER PRIMARY KEY, user_name, salt, salted_password, user_type)";
const table_users_delete="DROP TABLE users";

//db.run(table_users_delete);
//----------------------------------

//-----Create the tables-----
db.run(table_users_create, (err)=>{
    if(err){
        return console.log(err.message);
    }

    //Create admin account
    //user_name: admin
    //password : admin
    db.all("SELECT * FROM users WHERE user_name=?", "admin", (err, rows)=>{
        if (err) return console.log(err.message);

        if (rows.length==0){
            bcrypt.genSalt(10, (err, curr_salt)=>{
                if (err) return console.log(err.message);
        
                bcrypt.hash("admin", curr_salt, (err, hash)=>{
                    if (err) return console.log(err.message);
                
                    db.run("INSERT INTO users (user_name, salt, salted_password, user_type) VALUES (?, ?, ?, ?)", "admin", curr_salt, hash, user_type.admin, (err)=>{
                        if (err) return console.log(err.message);
                    })
                })
            })
        }
    });
    
});



//---------------------------

app.get("/", cors(), async (req, res)=>{
    res.send("Hello World!");
});

//-----Return the user info form cookie-----
app.post("/get_cookie", cors(), async(req, res)=>{
    res_cors_header(res);

    let cookie = req.signedCookies;
    if (cookie != null && cookie.user!=null){
        db.all("SELECT * FROM users WHERE user_id=?", cookie.user, (err, rows)=>{
            if (err)return console.log(err.message);
            if (rows.length==1){
                let data={name: rows[0].user_name, id: cookie.user};
                res.send(data);
            }
            else{
                res.send("Invalid");
                return;
            }
        })
    }
    else{
        res.send("Invalid");
        res.end();
    }
});
//------------------------------------------

//-----Insert the user info into the SQLite-----
app.post("/signup", cors(), async(req, res)=>{
    res_cors_header(res);

    const user_signup={
        name: req.body.name,
        password: req.body.password,
    }

    try{
        db.all("SELECT * FROM users WHERE user_name=?", user_signup.name, (err, rows)=>{
            if (err) return console.log(err.message);

            let valid=(rows.length==0);
            if (valid){
                bcrypt.genSalt(10, (err, curr_salt)=>{
                    if (err) return console.log(err.message);

                    bcrypt.hash(user_signup.password, curr_salt, (err, hash)=>{
                        if (err) return console.log(err.message);
                        
                        db.run("INSERT INTO users (user_name, salt, salted_password, user_type) VALUES (?, ?, ?, ?)", user_signup.name, curr_salt, hash, user_type.normal, (err)=>{
                            if (err) return console.log(err.message);
                            
                            db.get("SELECT last_insert_rowid() as user_id FROM users", (err, row)=>{
                                if (err) return console.log(err.message);
                            
                                res.cookie('user', row.user_id, cookie_setting);
                                res.send(valid);
                            })
                        })
                    })
                })
            }
            else res.send(valid)
        });
    }
    catch(err){
        res.send("Error");
        return console.log(err.message);
    }
});
//----------------------------------------------


//-----User Login, and return the result-----
app.post("/login", cors(), async(req, res)=>{
    res_cors_header(res);

    const user_login={
        name:req.body.name,
        password: req.body.password,
    }

    try{
        db.all("SELECT * FROM users WHERE user_name=?", user_login.name, (err, rows)=>{
            if (err) return console.log(err.message);

            if (rows.length==0){
                res.send(false);
            }
            else{
                rows.forEach((row)=>{
                    bcrypt.hash(user_login.password, row.salt, (err, hash)=>{
                        if (err) return console.log(err.message);
                        
                        let valid=(hash==row.salted_password);
                        if(valid){
                            res.cookie('user', row.user_id, cookie_setting);
                        }
                        res.send(valid);
                    })
                })
            }
        })
    }
    catch(err){
        res.send("fail");
        console.log(err.message);
    }
});
//-------------------------------------------


//-----Show the user list-----
app.post("/userlist", cors(), async(req, res)=>{
    res_cors_header(res);

    let cookie = req.signedCookies;
    if (cookie != null && cookie.user!=null){
        db.all("SELECT * FROM users WHERE user_id=?", cookie.user, (err, rows)=>{
            if (err)return err.message;
            if (rows.length==1 && rows[0].user_type==user_type.admin){
                db.all("SELECT * FROM users", (err, rows)=>{
                    if (err) return console.log(err.message);
                    res.send(rows);
                })
            }
            else res.send("Invalid");
        })
    }
    else{
        res.send("Invalid");
    }
});
//----------------------------

//-----Change the password-----
app.post("/change_password", cors(), async(req, res)=>{
    res_cors_header(res);

    let curr_password=req.body.curr_password;
    let new_password=req.body.new_password;

    let cookie = req.signedCookies;
    if (cookie != null && cookie.user!=null){
        db.all("SELECT * FROM users WHERE user_id=?", cookie.user, (err, rows)=>{
            if (err)return err.message;
            if (rows.length==1){
                let user=rows[0];

                bcrypt.hash(curr_password, user.salt, (err, hash)=>{
                    if(hash==user.salted_password){
                        bcrypt.hash(new_password, user.salt, (err, new_hash)=>{
                            db.run("UPDATE users SET salted_password=? WHERE user_id=?", new_hash, cookie.user, (err)=>{
                                if (err){
                                    console.log(err.message);
                                    res.send(false);
                                    return;
                                }
                                else{
                                    res.send(true);
                                    return;
                                }
                            })
                        })
                    }
                })
            }
            else res.send(false);
        })
    }
    else{
        res.send(false);
    }
});
//-----------------------------

//-----Logout-----
app.post("/logout", cors(), async(req, res)=>{
    res_cors_header(res);

    try{
        res.clearCookie("user");
        res.send(true);
    }
    catch(err){
        console.log(err.message);
        res.send(false);
    }

    res.end();
})


//-----Listen at Port 8080-----
console.log("Running");
const http=require("http");
//const { table } = require("console");
http.createServer(app).listen(8080);
console.log("Frontend: ReactJS is running at Port 3000");
console.log("Backend : NodeJS  is running at Port 8080");
//-----------------------------
