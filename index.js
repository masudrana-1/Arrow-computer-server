const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

const stripeSk = require("stripe")(process.env.REACT_APP_STRIPE_SK);
// const stripeSk = require("stripe")("sk_test_51M7AIcJbEvprLQEgKhNa8jmgjlcPxTPcPjj5er1AVt5DPTAxI9otLmFLULm3istn3XYDd99Hn5odWQmBoF69amLW00KMC0chOn");

// console.log(stripeSk);

app.use(cors());
app.use(express.json());


// *****************************************************************************************

// mongodb 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjxkvs1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {


    // jwt function 
    function verifyJWT(req, res, next) {
        const authHeader = req.headers.authorization;
        // console.log(authHeader);

        if (!authHeader) {
            return res.status(401).send({ message: 'Unauthorized access' });
        }

        const token = authHeader.split(' ')[1];
        // console.log(token);
        // console.log(process.env.ACCESS_TOKEN);

        jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
            // console.log(decoded);
            if (error) {
                return res.status(403).send({ message: "forbidden access" });
            }
            req.decoded = decoded;
            next();
        });
    }


    try {
        const categoriesCollection = client.db('Arrow-Computer').collection('productCategories');
        const productsCollection = client.db('Arrow-Computer').collection('products');
        const productCartCollection = client.db('Arrow-Computer').collection('productCart');
        const advertiseCollection = client.db('Arrow-Computer').collection('advertise');
        const wishlistCollection = client.db('Arrow-Computer').collection('wishlist');
        const paymentsCollection = client.db('Arrow-Computer').collection('payments');
        const usersCollection = client.db('Arrow-Computer').collection('users');

        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        });


        // get api 

        app.get('/products', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });


        app.get('/products/:product_type', async (req, res) => {
            const type = req.params.product_type;
            // console.log(type);
            const query = { product_type: type };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });


        app.get('/productCart', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = productCartCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/advertise', async (req, res) => {
            const query = {};
            const products = await advertiseCollection.find(query).toArray();
            res.send(products);
        });

        app.get('/wishlist', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = wishlistCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });




        // jwt
        // app.get('/jwt', async (req, res) => {

        //     // user login ace ki na seta email diye check korbo
        //     // thakle token dibo na thakle dibo na 

        //     const email = req.query.email;
        //     const query = { email: email };
        //     const user = await userCollection.findOne(query);
        //     if (user) {
        //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
        //         return res.send({ accessToken: token });
        //     }
        //     res.status(403).send({ accessToken: '' });
        // });



        // post api

        app.post('/products', verifyJWT, async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        app.post('/productCart', async (req, res) => {
            const product = req.body;
            const result = await productCartCollection.insertOne(product);
            res.send(result);
        });

        app.post('/advertise', async (req, res) => {
            const product = req.body;
            const result = await advertiseCollection.insertOne(product);
            res.send(result);
        });
        app.post('/wishlist', async (req, res) => {
            const product = req.body;
            const result = await wishlistCollection.insertOne(product);
            res.send(result);
        });





        // user get api
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/:role', async (req, res) => {
            const user = req.params.role;
            const query = { role: user };
            const userRole = await usersCollection.find(query).toArray();
            res.send(userRole);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'Admin' });
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'Buyer' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        })



        // verify seller api
        app.put('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    verify: true
                }
            }
            const updatedResult = await usersCollection.updateOne(filter, updatedDoc);

            res.send(updatedResult)
        })


        // user role update api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });



        // delete api 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });

        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await wishlistCollection.deleteOne(filter);
            res.send(result);
        });








        // ************************************
        // delete by seller (from all collection) 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            const deleteFromWishlist = await wishlistCollection.deleteOne({ product_id: req.params.id })
            const deleteFromProductCart = await productCartCollection.deleteOne({ product_id: req.params.id })
            const deleteFromAdvertise = await advertiseCollection.deleteOne({ product_id: req.params.id })
            res.send(result);
        });

        app.delete('/productCart/:title', async (req, res) => {
            const title = req.params.title;
            const filter = { title: title };
            const result = await productCartCollection.deleteOne(filter);
            res.send(result);
        });


        // *********************************************


        //********************************************************/

        // // for payment to get product id 
        app.get('/productCart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCartCollection.findOne(query);
            res.send(result)
        })



        // payment api      
        app.post('/create-payment-intent', async (req, res) => {
            const productCart = req.body;
            const price = productCart.price;

            console.log(price);
            const amount = price * 100;

            const paymentIntent = await stripeSk.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]

            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })


        // save payment info to database 
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);

            const id = payment.product_id;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await productCartCollection.updateOne(filter, updatedDoc);

            res.send(result);
        })






        // *************************************************************/




    }
    finally {

    }



}
run().catch(error => console.log(error));




// *****************************************************************************************


app.get('/', (req, res) => {
    res.send('Arrow Computer server is running');
})

app.listen(port, () => {
    console.log(`Arrow computer server is running on port: ${port}`);
})