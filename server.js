const express = require("express") // import express
const app = express() // use app for shorthand express
const pg = require("pg") // access to postgres
app.use(express.json()) // knows how to convert it to json for post/put/get etc
app.use(require("morgan")("dev"))
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory_db')

// create port
const PORT = process.env.PORT || 3000

const init = async () =>{

    // connect to our database
    await client.connect()

    let SQL = `
        DROP TABLE IF EXISTS employees, departments;
        CREATE TABLE departments(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
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
        
    `

    app.listen(PORT, ()=>{
        console.log(`I am listening on port number ${PORT}`)
    })


  
}

init()