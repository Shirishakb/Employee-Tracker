use employee_db
-- Insert data into the employees table

INSERT INTO department (name)
VALUES ('Engineering'),
       ('Sales'),
       ('Finance'),
       ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES ('Lead Engineer', 100000, 1),
       ('Engineer', 80000, 1),
       ('Sales Lead', 80000, 2),
       ('Salesperson', 60000, 2),
       ('Accountant', 70000, 3),
       ('Legal Team Lead', 250000, 4),
       ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Mike', 'Chan', 2, 1),
       ('Ashley', 'Rodriguez', 3, NULL),
       ('Kevin', 'Tupik', 4, 3),
       ('Malia', 'Brown', 5, 3),
       ('Sarah', 'Lourd', 6, NULL),
       ('Tom', 'Allen', 7, 6);
       
