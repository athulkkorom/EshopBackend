import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Products from './models/Products.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js'
import Admin from './models/Admin.js';
import 'dotenv/config.js'
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
     })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });
  app.post('/signup', async (req, res) => {
    const { email, password, Name } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash password
    const saltRounds = 10;
    try {
   bcrypt.genSalt(saltRounds,(error,salt)=>{
    bcrypt.hash(password,salt,async(error,hashedPassword)=>{
      const user = new User({ Name, email, password: hashedPassword });
      await user.save();
      const cart = new Cart({email,products:[]})
      const order = new Order({email,products:[]})
      await cart.save()
      await order.save()

      res.status(201).json({ message: 'User created' });
    })
   })
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, 'mysecretkey', { expiresIn: '1h' });
    res.status(200).json({ message: 'Authentication successful', token, user });
  });

  
  app.get('/api/products', async (req, res) => {
    try {
      const products = await Products.find({});
      res.status(200).json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/products/slug/:slug', async (req, res) => {
    const slug = req.params.slug;
    try {
      const product = await Products.findOne({ slug });
      if (product) {
        res.status(200).json(product);
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.delete('/api/delete/slug/:slug', async (req, res) => {
    const slug = req.params.slug;
    try {
      const result = await Products.deleteOne({ slug });
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Product deleted' });
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
    

  app.post('/upload', async (req, res) => {
    const { name, slug, categary, image, stock, countInStock, brand, rating, numReviews, description, price } = req.body;
    const product = new Products({
      name,
      slug,
      categary,
      image,
      countInStock,
      brand,
      rating,
      numReviews,
      description,
      price,
    });
    try {
      await product.save();
      console.log('Product created');
      res.status(201).json({ message: 'Product created' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  // add to cart
  app.post('/cart/add',async(req,res)=>{
const{email,productId}=req.body
if(email&&productId){
const cart = await Cart.findOne({email})
const product = await Products.findById(productId)
if(cart&&product){
  cart.products = [...cart.products,product]
  await cart.save()
  res.json({message:"succcess"})
}
}
  })
  app.get('/cart',async(req,res)=>{

    const{email}=req.query
if(email){
const cart = await Cart.findOne({email})
if(cart){
res.status(200).json(cart)
}
}
  })
  app.put('/cart/remove', async (req, res) => {
    const { email, productId } = req.body;
    if (email && productId) {
      try {
        const cart = await Cart.findOne({ email });
        const prod = await Products.findById(productId);
        if (cart && prod) {
          await Cart.updateOne({ email }, { $pull: { products: { _id: productId } } });
          res.json({ message: "success" });
        } else {
          res.json({ message: "Cart or product is not valid" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    } else {
      res.json({ message: "Missing email or product id" });
    }
  });
  
        app.get('/cart/email/:email', async (req, res) => {
          const email = req.params.email;
          try {
            const cart = await Cart.findOne({ email });
            if (cart) {
              res.status(200).json(cart);
            } else {
              res.sendStatus(404);
            }
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
          }
        });
    //Order product
    app.post('/order/add', async (req, res) => {
      const { email, productId, Name, Address, pincode, mobileNo, payment } = req.body;
      if (email && productId) {
        const order = await Order.findOne({ email });
        const product = await Products.findById(productId);
        if (order && product) {
          const orderItem = {
            product: product,
            Name: Name,
            Address: Address,
            pincode: pincode,
            mobileNo: mobileNo,
            payment: payment
          };
          order.products.push(orderItem);
          await order.save();
          res.json({ message: "success" });
        } else {
          res.status(404).json({ message: "Order or product not found" });
        }
      }
       else {
        res.status(400).json({ message: "Missing required fields" });
      }
    });
    app.post('/adminsignup', async (req, res) => {
      const { AdminCode,MobileNo } = req.body;

      // Check if mobile is already in use
      const existingUser = await Admin.findOne({ MobileNo });
      if (existingUser) {
        return res.status(409).json({ message: 'number already in use' });
      }

      // Hash password
      const saltRounds = 10;
      try {
        const hashedPassword = await bcrypt.hash(AdminCode, saltRounds);

        // Create user
        const admin = new Admin({ MobileNo,AdminCode: hashedPassword });
        await admin.save();
       

        res.status(201).json({ message: 'User created' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.post('/adminlogin', async (req, res) => {
      const { MobileNo,AdminCode } = req.body;

      // Check if user exists
      const user = await Admin.findOne({ MobileNo });
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Check password
      const isPasswordCorrect = await bcrypt.compare(AdminCode, user.AdminCode);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      // Generate JWT token
      const admintoken = jwt.sign({ MobileNo: user.MobileNo }, 'mysecretkey', { expiresIn: '1h' });
      res.status(200).json({ message: 'Authentication successful', admintoken, user });
    });
    app.get('/orders', async (req, res) => {
      try {
        const orders = await Order.find({});
        res.status(200).json(orders);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching orders.' });
      }
    });
    
    app.get('/myorder/email/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const order = await Order.findOne({ email });
        if (order) {
          res.status(200).json(order);
        } else {
          res.sendStatus(404);
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

