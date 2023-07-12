import mongoose from 'mongoose'
const { Schema } = mongoose;

const productsSchema = new Schema({
    name:{type:String,required:true},
        slug:{type:String,required:true},
        categary:{type:String,required:true},
        image:{type:String,required:true},
        price:{type:String,required:true},
        countInStock:{type:String,required:true},
        brand:{type:String,required:true},
        rating:{type:String,required:true},
        numReviews:{type:String,required:true},
        description:{type:String,required:true},
    
  });
  const Products = mongoose.model('Products', productsSchema)
   export default Products;
