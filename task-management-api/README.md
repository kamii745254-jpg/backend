\# Task Management REST API



A RESTful API built using Node.js, Express.js, and PostgreSQL to manage users, projects, and tasks.



\## Features



\* User registration and login

\* Password hashing using bcryptjs

\* JWT-based authentication

\* CRUD operations for users, projects, and tasks

\* PostgreSQL database relationships

\* Search and filtering of tasks

\* Pagination and sorting

\* Overdue task detection

\* Dashboard statistics

\* Input validation and error handling



\## Technologies Used



\* Node.js

\* Express.js

\* PostgreSQL

\* pg

\* bcryptjs

\* jsonwebtoken

\* dotenv

\* cors



\## Installation



1\. Clone or download this repository.



2\. Open the project folder in a terminal.



3\. Install dependencies:



&#x20;  `npm install`



4\. Create a `.env` file in the project root and configure:



&#x20;  ```env

&#x20;  PORT=5000

&#x20;  DB\_HOST=localhost

&#x20;  DB\_PORT=5432

&#x20;  DB\_NAME=task\_management\_db

&#x20;  DB\_USER=postgres

&#x20;  DB\_PASSWORD=your\_database\_password

&#x20;  JWT\_SECRET=replace\_with\_a\_long\_random\_secret

&#x20;  ```



&#x20;  Replace the example database password and JWT secret with your own values.



5\. Create the PostgreSQL database named `task\_management\_db` and set up the required tables and relationships.



6\. Start the development server using `npm run dev` if that script is configured in `package.json`.



\## API Endpoints



\### Users



| Method | Endpoint           | Description      |

| ------ | ------------------ | ---------------- |

| POST   | `/api/users`       | Register a user  |

| POST   | `/api/users/login` | Log in           |

| GET    | `/api/users`       | Get users        |

| GET    | `/api/users/:id`   | Get a user by ID |

| PUT    | `/api/users/:id`   | Update a user    |

| DELETE | `/api/users/:id`   | Delete a user    |



\### Projects



| Method | Endpoint            | Description      |

| ------ | ------------------- | ---------------- |

| POST   | `/api/projects`     | Create a project |

| GET    | `/api/projects`     | Get projects     |

| GET    | `/api/projects/:id` | Get a project    |

| PUT    | `/api/projects/:id` | Update a project |

| DELETE | `/api/projects/:id` | Delete a project |



\### Tasks



| Method | Endpoint         | Description   |

| ------ | ---------------- | ------------- |

| POST   | `/api/tasks`     | Create a task |

| GET    | `/api/tasks`     | Get tasks     |

| GET    | `/api/tasks/:id` | Get a task    |

| PUT    | `/api/tasks/:id` | Update a task |

| DELETE | `/api/tasks/:id` | Delete a task |



\### Dashboard



| Method | Endpoint         | Description         |

| ------ | ---------------- | ------------------- |

| GET    | `/api/dashboard` | Get task statistics |



\## Task Query Parameters



The task listing endpoint supports parameters such as:



\* `search` — search task details

\* `status` — filter by status

\* `priority` — filter by priority

\* `project\_id` — filter by project

\* `user\_id` — filter by user

\* `page` and `limit` — pagination

\* `sortBy` and `order` — sorting

\* `overdue` — filter overdue tasks



Example:



`GET /api/tasks?status=pending\&page=1\&limit=10`



\## Authentication



After login, the API returns a JWT token. For protected task routes, send the token in the HTTP Authorization header:



`Authorization: Bearer YOUR\_JWT\_TOKEN`



\## Testing



API endpoints can be tested using Postman. Test successful requests, invalid input, missing authentication, and database errors.



\## Security



\* Passwords are stored as hashes.

\* Keep `.env` out of version control.

\* Use a strong, private JWT secret.

\* Never publish database passwords or authentication tokens.



\## Author



Task Management REST API — developed as a backend learning assignment.



