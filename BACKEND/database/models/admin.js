
const mongoose=require('mongoose');
const AdminSchema = new mongoose.Schema({
    seatno:{
        type:Number,
        required:true,
        unique:true,
        min: [1, 'Minimun seat number is 1'],
        max: [40, 'Maximum seat number is 40']
    },
   
    status:{
        type:Boolean,
        default:false
    },

    updated_at:{
        type:Date,
        default: Date.now()
    },
});


const Admin=mongoose.model('Admin',AdminSchema);
module.exports=Admin;
