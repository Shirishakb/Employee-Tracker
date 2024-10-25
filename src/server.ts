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
            "view employees by manager",
            "view employees by department",
            "add employee",
            "add department",
            "add role",
            "update employee role",
            "update employee manager",
            "Delete employee",
            "Delete department",
            "Delete role",
            "view total utilized budget of a department",
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
            case "view employees by manager":
                viewEmployeesByManager();
                break;
            case "view employees by department":
                viewEmployeesByDepartment();
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
            case "update employee manager":
                updateEmployeeManager();
                break;
            case "Delete employee":
                deleteEmployee();
                break;
            case "Delete department":
                deleteDepartment();
                break;
            case "Delete role":
                deleteRole();
                break;
            case "view total utilized budget of a department":
                viewDepartmentBudget();
                break;
            default:
                pool.end();
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

// View employees by manager
function viewEmployeesByManager() {
    inquirer.prompt([
        {
            message: "Enter the manager's ID:",
            type: "number",
            name: "managerId"
        }
    ]).then((res) => {
        pool.query(
            "SELECT * FROM employee WHERE manager_id = $1",
            [res.managerId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.table(result.rows);
                askQuestions();
            }
        );
    });
}

// View employees by department
function viewEmployeesByDepartment() {
    inquirer.prompt([
        {
            message: "Enter the department ID:",
            type: "number",
            name: "departmentId"
        }
    ]).then((res) => {
        pool.query(
            `SELECT employee.first_name, employee.last_name, role.title 
            FROM employee 
            JOIN role ON employee.role_id = role.id 
            WHERE role.department_id = $1`,
            [res.departmentId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.table(result.rows);
                askQuestions();
            }
        );
    });
}

// View total utilized budget of a department (sum of all employee salaries in a department)
function viewDepartmentBudget() {
    inquirer.prompt([
        {
            message: "Enter the department ID:",
            type: "number",
            name: "departmentId"
        }
    ]).then((res) => {
        pool.query(
            `SELECT SUM(role.salary) AS total_budget 
            FROM employee 
            JOIN role ON employee.role_id = role.id 
            WHERE role.department_id = $1`,
            [res.departmentId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.table(result.rows);
                askQuestions();
            }
        );
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
            "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
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

// Update an employee's manager
function updateEmployeeManager() {
    inquirer.prompt([
        {
            message: "Which employee would you like to update? (use first name only for now)",
            type: "input",
            name: "name"
        },
        {
            message: "Enter the new manager ID:",
            type: "number",
            name: "managerId"
        }
    ]).then((response) => {
        pool.query(
            "UPDATE employee SET manager_id = $1 WHERE first_name = $2",
            [response.managerId, response.name],
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

// Delete an employee
function deleteEmployee() {
    inquirer.prompt([
        {
            message: "Which employee would you like to delete? (use first name only for now)",
            type: "input",
            name: "name"
        }
    ]).then((response) => {
        pool.query(
            "DELETE FROM employee WHERE first_name = $1",
            [response.name],
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Successfully Deleted");
                askQuestions();
            }
        );
    });
}

// Delete a department
function deleteDepartment() {
    inquirer.prompt([
        {
            message: "Which department would you like to delete?",
            type: "input",
            name: "name"
        }
    ]).then((response) => {
        pool.query(
            "DELETE FROM department WHERE name = $1",
            [response.name],
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Successfully Deleted");
                askQuestions();
            }
        );
    });
}

// Delete a role
function deleteRole() {
    inquirer.prompt([
        {
            message: "Which role would you like to delete?",
            type: "input",
            name: "name"
        }
    ]).then((response) => {
        pool.query(
            "DELETE FROM role WHERE title = $1",
            [response.name],
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("Successfully Deleted");
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
