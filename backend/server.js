import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req,res) => {
    res.send("Everything is working!")
});

app.get('/hello', (req,res) => {
    res.send("Hello is working!")
});

app.listen(port, () => {
    console.log(`My SQL app listening on http://localhost:${port}`)
});