import mongoose from 'mongoose'
const { Schema } = mongoose;

const cartSchema = new Schema({
    email:{type:String,required:true},
    products:{type:Array}
  });
  const Cart = mongoose.model('Cart', cartSchema)
   export default Cart;
