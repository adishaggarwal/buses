
const mongoose=require('mongoose');

const CustomerSchema = new mongoose.Schema({
    
    bookstatus:{
        type:String,
        required:true,
        enum: ['Confirm', 'Admin_cancelled','Customer_cancelled']
    },
    name:{
        type:String,
        trim:true,
        required:true,
        minlength:3
    },
    age:{
        type:Number,
        required:true,
        min: [1, 'Minimun age is 1'],
        max: [100, 'Maximum age is 100'],
    },
    seatno:[{
        type:Number,
        required:true,
        min: [1, 'Minimun seat number is 1'],
        max: [40, 'Maximum seat number is 40']
    }],
    _booking_id:{
        type:mongoose.Types.ObjectId,
        required:true
    },
   
    updated_at:{
        type:Date,
        default: Date.now()
    },
});


const Customer=mongoose.model('Customer',CustomerSchema);
module.exports=Customer;