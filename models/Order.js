import mongoose from 'mongoose'
const { Schema } = mongoose;

const orderSchema = new Schema({
    email:{type:String,required:true},
    products:{type:Array}
    // Name:{type:String,required:true},
    // Address:{type:String,required:true},
    // pincode:{type:String,required:true},
    // mobileNo:{type:String,required:true},
    // payment:{type:String,required:true},
    
  });
  const Order = mongoose.model('Order', orderSchema)
   export default Order;
