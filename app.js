
import express from 'express';

const app = express();

app.use(express.json());

const products = [
    {
        id: 1,
        name: "Laptop",
        price: 80000
    },
    {
        id: 2,
        name: "Mobile",
        price: 50000
    }
];

// GET all products
app.get('/products', (req, res) => {
    res.json(products);
});

// CREATE a new product
app.post('/products', (req, res) => {
    const newProduct = req.body;

    products.push(newProduct);

    res.json(newProduct);
});

// Home route
app.get('/', (req, res) => {
    res.json("Hello server is running on port no 5000");
});

// Contact route
app.get('/contact', (req, res) => {
    res.json("Hello contact page");
});

// About route
app.get('/about', (req, res) => {
    res.json("Hello about page");
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

