import mongoose from 'mongoose'
const { Schema } = mongoose;

const adminSchema = new Schema({
    AdminCode: {type:String,required:true},
    MobileNo: {type:String,required:true},
  });
  const Admin = mongoose.model('Admin', adminSchema)
   export default Admin;
