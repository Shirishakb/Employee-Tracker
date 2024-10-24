import express from 'express';
import inquirer from 'inquirer'; // Don't forget to install this package if you haven't.
import { pool, connectToDb } from './connection.js';

// Connect to the PostgreSQL database
await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Main prompt function
function askQuestions() {
    inquirer.prompt({
        message: "What would you like to do?",
        type: "list",
        choices: [
            "view all employees",
            "view all departments",
            "add employee",
            "add department",
            "add role",
            "update employee role",
            "QUIT"
        ],
        name: "choice"
    }).then((answers) => {
        console.log(answers.choice);
        switch (answers.choice) {
            case "view all employees":
                viewEmployees();
                break;
            case "view all departments":
                viewDepartments();
                break;
            case "add employee":
                addEmployee();
                break;
            case "add department":
                addDepartment();
                break;
            case "add role":
                addRole();
                break;
            case "update employee role":
                updateEmployeeRole();
                break;
            default:
                pool.end();  // Close the PostgreSQL connection pool
                break;
        }
    });
}

// View all employees
function viewEmployees() {
    pool.query("SELECT * FROM employee", (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.table(result.rows);  // Use result.rows to access query data in PostgreSQL
        askQuestions();
    });
}

// View all departments
function viewDepartments() {
    pool.query("SELECT * FROM department", (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.table(result.rows);
        askQuestions();
    });
}

// Add a new employee
function addEmployee() {
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
        },
        {
            type: "number",
            name: "roleId",
            message: "What is the employee's role ID?"
        },
        {
            type: "number",
            name: "managerId",
            message: "What is the employee's manager's ID?"
        }
    ]).then((res) => {
        pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
            [res.firstName, res.lastName, res.roleId, res.managerId],
            (err) => {
                if (err) throw err;
                console.log("Successfully Inserted");
                askQuestions();
            }
        );
    });
}

// Add a new department
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "What is the department that you want to add?"
        }
    ]).then((res) => {
        pool.query(
            'INSERT INTO department (name) VALUES ($1)', 
            [res.department], 
            (err) => {
                if (err) throw err;
                console.log("Successfully Inserted");
                askQuestions();
            }
        );
    });
}

// Add a new role
function addRole() {
    inquirer.prompt([
        {
            message: "Enter title:",
            type: "input",
            name: "title"
        },
        {
            message: "Enter salary:",
            type: "number",
            name: "salary"
        },
        {
            message: "Enter department ID:",
            type: "number",
            name: "department_id"
        }
    ]).then((response) => {
        pool.query(
            "INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)",
            [response.title, response.salary, response.department_id],
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Successfully Inserted");
                askQuestions();
            }
        );
    });
}

// Update an employee's role
function updateEmployeeRole() {
    inquirer.prompt([
        {
            message: "Which employee would you like to update? (use first name only for now)",
            type: "input",
            name: "name"
        },
        {
            message: "Enter the new role ID:",
            type: "number",
            name: "role_id"
        }
    ]).then((response) => {
        pool.query(
            "UPDATE employee SET role_id = $1 WHERE first_name = $2",
            [response.role_id, response.name],
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Successfully Updated");
                askQuestions();
            }
        );
    });
}

// Start the application
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    askQuestions();
});
