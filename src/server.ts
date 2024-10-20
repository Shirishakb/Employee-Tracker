import express from 'express';
import {QueryResult} from 'pg';
import {pool, connectToDb} from './connection';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Create a employee database
app.post('/api/new-employee', ({body}, res) => {
    const sql = `INSERT INTO employees (first_name, last_name, role, department)
    VALUES ($1, $2, $3, $4)`;
    const params = [body.first_name, body.last_name, body.role, body.department];

    pool.query(sql, params, (err, _result) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: body,
        });
    });
});

// Read all employees
app.get('/api/employees', (_req, res) => {
    const sql = `SELECT id, first_name, last_name, role, department FROM employees`;

    pool.query(sql, (err: Error, result: QueryResult) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        const {rows} = result;
        res.json({
            message: 'success',
            data: rows,
        });
    });
});

// Delete a employee
app.delete('/api/employee/:id', (req, res) => {
    const sql = `DELETE FROM employees WHERE id = $1`;
    const params = [req.params.id];

    pool.query(sql, params, (err: Error, result: QueryResult) => {
        if (err) {
            res.status(400).json({error: err.message});
        } else if (!result.rowCount) {
            res.json({
                message: 'Employee not found',
            });
        }
    });
});

// Update an employee
app.put('/api/employee/:id', (req, res) => {
    const sql = `UPDATE employees SET first_name = $1, last_name = $2, role = $3, department = $4 WHERE id = $5`;
    const params = [req.body.first_name, req.body.last_name, req.body.role, req.body.department, req.params.id];

    pool.query(sql, params, (err, _result) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: req.body,
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
