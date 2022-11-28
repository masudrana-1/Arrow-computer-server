const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();



app.use(cors());
app.use(express.json());


// *****************************************************************************************

// mongodb 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjxkvs1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

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


        // get 

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
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
            const query = {};
            const products = await productCartCollection.find(query).toArray();
            res.send(products);
        });

        app.get('/advertise', async (req, res) => {
            const query = {};
            const products = await advertiseCollection.find(query).toArray();
            res.send(products);
        });
        app.get('/wishlist', async (req, res) => {
            const query = {};
            const products = await wishlistCollection.find(query).toArray();
            res.send(products);
        });






        // post 

        app.post('/products', async (req, res) => {
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





        // user  api
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


        app.delete('/products/:title', async (req, res) => {
            const title = req.params.title;
            const filter = { title: title };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        });


        app.delete('/productCart/:title', async (req, res) => {
            const title = req.params.title;
            const filter = { title: title };
            const result = await productCartCollection.deleteOne(filter);
            res.send(result);
        });

        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await wishlistCollection.deleteOne(filter);
            res.send(result);
        });







        //********************************************************/

        app.get('/productCard/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const result = await productCartCollection.findOne(filter);
            res.send(result);
        })



        // payment api      
        app.post('/create-payment-intent', async (req, res) => {
            const productCart = req.body;
            const price = productCart.price;

            // price k poysay convert korte hobe 
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
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

            const id = payment._id;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc);

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