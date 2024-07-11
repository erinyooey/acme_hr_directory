const express = require("express") // import express
const app = express() // use app for shorthand express
const pg = require("pg") // access to postgres
app.use(express.json()) // knows how to convert it to json for post/put/get etc
app.use(require("morgan")("dev"))
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db')

// Array of departments
app.get('/api/departments', async(req, res, next)=>{
    try {
        const SQL = `SELECT * from departments`
        const response = await client.query(SQL)
        res.send(response.rows);
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// Array of employees
app.get('/api/employees', async(req, res, next)=>{
    try {
        const SQL = `SELECT * from employees ORDER BY created_at DESC`
        const response = await client.query(SQL)
        res.send(response.rows);
    } catch (error) {
        console.log(error)
        next(error)
    }
})


app.post('/api/employees', async(req, res, next)=>{
    try {
        const SQL = `INSERT INTO employees(name, departments_id) values ($1, $2) RETURNING *`; 
        const response = await client.query(SQL, [req.body.name, req.body.departments_id,]);
        res.send(response.rows);
    } catch (error) {
        console.log(error)
        next(error)
    }
})

app.put('/api/employees/:id', async(req, res, next)=>{
    try {
        const SQL = `UPDATE employees SET name = $1, departments_id = $2, updated_at = now() WHERE id=$3 RETURNING *`; 
        const response = await client.query(SQL, [req.body.name, req.body.departments_id, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        console.log(error)
        next(error)
    }
})

app.delete('/api/employees/:id', async(req, res, next)=>{
    try {
        const SQL = `DELETE from employees WHERE id = $1`; 
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// More error handling
app.use((err, req, res, next)=>{
    console.error(err.stack)
    res.status(500).json({error: err.message})
})

// create port
const PORT = process.env.PORT || 3000

const init = async () =>{

    // connect to our database
    await client.connect()

    let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments(
            id SERIAL PRIMARY KEY,
            department VARCHAR(255) NOT NULL
        );
        CREATE TABLE employees(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            departments_id INTEGER REFERENCES departments(id) NOT NULL
        );
    `;
    
    await client.query(SQL)

    SQL = `
        INSERT INTO departments(department) VALUES('IT');
        INSERT INTO departments(department) VALUES('Finance');
        INSERT INTO departments(department) VALUES('Accounting');

        INSERT INTO employees(name, departments_id) VALUES('Ian', (SELECT id from departments WHERE department = 'IT'));
        INSERT INTO employees(name, departments_id) VALUES('Taylor', (SELECT id from departments WHERE department = 'Accounting'));
        INSERT INTO employees(name, departments_id) VALUES('Nikki', (SELECT id from departments WHERE department = 'Finance'));

    `
    await client.query(SQL)

    app.listen(PORT, ()=>{
        console.log(`I am listening on port number ${PORT}`)
    })

}

init();