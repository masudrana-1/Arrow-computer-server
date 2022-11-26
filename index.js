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

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjxkvs1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const categoriesCollection = client.db('Arrow-Computer').collection('productCategories');
        const productsCollection = client.db('Arrow-Computer').collection('products');

        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        });


        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });


        app.get('/products/:product_type', async (req, res) => {
            const type = req.params.product_type;

            console.log(type);

            const query = { product_type: type };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })


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