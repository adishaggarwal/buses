const express = require('express');
const app=express();
app.use(express.json());
const mongoose=require('./database/mongoose');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors=require('cors');
app.use(cors());

//CORS 
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept");
    next();
})



//auth
const jwt = require("jsonwebtoken");
const config = require("./config");
const authorize = require("./authorization-middleware");



//token genereTION

/*
app.get("/token", (req, res) => {
    const payload = {
      name: "Jimmy",
      scopes: ["admin:access"]
    };
  
    const token = jwt.sign(payload, config.JWT_SECRET);
    res.send(token);
  });
*/

var token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmltbXkiLCJzY29wZXMiOlsiYWRtaW46YWNjZXNzIl0sImlhdCI6MTU5MzE4OTM5Nn0.PJhOXRDMg-9XZlCJMLoHZpTtl8-C3l4lXeCZfXIeXN0";
  


const Admin=require('./database/models/admin');
const Customer=require('./database/models/customer');


//Bus Create,update,readone,readall,delete




//post a ticket
app.post('/tickets', authorize("admin:access"),(req,res)=>{
    new Admin({'seatno':req.body.seatno,'status':req.body.status})
    .save()
    .then((bus) =>res.send(bus))
    .catch((error)=>res.send(error));
});


//BOOK A TICKET
app.patch('/bookticket/:seat/:id',(req,res)=>{
    Admin.find({seatno:req.params.seat,status:false,_id:req.params.id})
    .then((resp)=>
     {
         console.log(resp);
         if(resp !="")
         {
             if(req.body.age<101 && req.body.age>0 && req.body.name.length>2)
             {
                 
                Customer.update({seatno:req.params.seat},{$set:{_booking_id:req.params.id,bookstatus:"Confirm",name:req.body.name,age:req.body.age}},{upsert:true})
                .then((bus) => res.send(bus))
                .catch((error)=>{
                    res.send(error);
                });
    
                Admin.updateOne({_id:req.params.id},{$set:{status:true}})
        .then((bus) =>res.send(bus))
        .catch((error)=>console.log(error));
             }
             else{
                res.send("Please fill in details correctly");
             }
           
         }
         else{
             res.send("Seat not available");
         }
       
    })
    .catch((error)=>res.send(error));
});

//get all tickets
app.get('/tickets', authorize("admin:access"),(req,res)=>{
    Admin.find({})
    .then(buses =>res.send(buses))
    .catch((error)=>console.log(error));
}); 


//cancel ticket by admin
app.patch('/canceladmin/:id/:seat', authorize("admin:access"),(req,res)=>{
    Customer.updateOne({_booking_id:req.params.id,seatno:req.params.seat},{$set:{bookstatus:"Admin_cancelled"}})
    .then((resp)=>
     {
         if(resp.nModified !=0)
         {
            Admin.updateOne({_id:req.params.id},{$set:{status:false}})
    .then((bus) =>res.send(bus))
    .catch((error)=>console.log(error));

    Admin.findOneAndDelete({_id:req.params.id})
    .then((buses) =>res.send(buses))
    .catch((error)=>console.log(error));
    
    
        
        new Admin({'seatno':req.params.seat,'status':false})
        .save()
        .then((bus) =>res.send(bus))
        .catch((error)=>res.send(error));

         }
         else{
             res.send("No such booking");
         }
    })
    .catch((error)=>res.send(error));
});


//cancel ticket by customer
app.delete('/cancelcustomer/:id/:seat',(req,res)=>{
    Customer.updateOne({_booking_id:req.params.id,seatno:req.params.seat,bookstatus:"Confirm"},{$set:{bookstatus:"Customer_cancelled"}})
    .then((resp)=>
     {
         console.log(resp);
         if(resp.nModified !=0)
         {
            Admin.findOneAndDelete({_id:req.params.id})
    .then((bus) =>res.send(bus))
    .catch((error)=>console.log(error));

    new Admin({'seatno':req.params.seat,'status':false})
        .save()
        .then((bus) =>res.send(bus))
        .catch((error)=>res.send(error));
         }
         else{
             res.send("No such booking");
         }
    })
    .catch((error)=>res.send(error));
});

//find ticket by ticket id
app.get('/tickets/:id',(req,res)=>{
    Customer.findOne({_booking_id:req.params.id})
    .then((bus) =>{

    if(bus !=null)
    {
        res.send(bus);
    }
    else{
        res.send("NO such booking");
    }
    })
    .catch((error)=>res.send("no such booking"));
});


//get all open tickets
app.get('/opentickets/',(req,res)=>{
    Admin.find({status:false})
    .then((buses) =>{
        console.log(buses);
        if(buses !="")
        {
            var data=[];
            for (var i = 0; i < buses.length; i++) {
                data[i]=JSON.stringify(buses[i].seatno);
              }
              res.send(data);
        }
        else
        {
            res.send("No seats available");
        }
    })
    .catch((error)=>console.log(error));
});



//get all closed tickets
app.get('/closedtickets/', authorize("admin:access"),(req,res)=>{
    Customer.find({bookstatus:"Confirm"})
    .then((buses) =>{
        console.log(buses);
        if(buses !="")
        {
            res.send(buses);
        }
        else
        {
            res.send("All seats available");
        }
    })
    .catch((error)=>console.log(error));
});


//update user data
app.patch('/ticketupdate/:id', authorize("admin:access"),(req,res)=>{
    if(req.body.name.length>2 && req.body.age>0 && req.body.age<101)
    {  Customer.updateOne({_booking_id:req.params.id,bookstatus:"Confirm"},{$set:{name:req.body.name,age:req.body.age}})
    .then((bus) =>{
        console.log(bus);
        if(bus !=null)
        {
            res.send(bus);
        }
        else{
            res.send("NO such booking");
        }
        })
    .catch((error)=>res.send("please enter valid"));}
    else{
        res.send("Please fill in correctly");
    }
  
});



//get ticket status
app.get('/ticketstatus/:id',(req,res)=>{
    Customer.findOne({_booking_id:req.params.id})
    .then((bus) =>{
        console.log(bus);
        res.send(bus.bookstatus);
    })
    .catch((error)=>{
        console.log(error);
        res.send("Please fill in correct id");
    });
});


//reset all tickets
app.delete('/ticketsreset/', authorize("admin:access"),(req,res)=>{
    Customer.updateMany({bookstatus:"Confirm"},{$set:{bookstatus:"Admin_cancelled"}})
    .then((buses) =>res.send(buses))
    .catch((error)=>console.log(error));

        Admin.remove()
    .then((buses) =>res.send(buses))
    .catch((error)=>console.log(error));
    
    for(var i=1;i<=40;i++)
    {
        var x=i;
        new Admin({'seatno':x,'status':false})
        .save()
        .then((bus) =>res.send(bus))
        .catch((error)=>res.send(error));
    }
});



app.listen(3000,()=> 
    console.log("Hey, Welcome to ticket booking system")
)