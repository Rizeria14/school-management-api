RESTful API built using Node.js, Express.js, and MySQL for managing school data.

Features:
- Add schools to database
- Fetch schools sorted by proximity to user location
- Input validation
- MySQL database integration
- Distance calculation using coordinates

Tech Stack:
Node.js, Express.js, MySQL, mysql2, dotenv, express-validator

git clone https://github.com/Rizeria14/school-management-api.git

cd school-management-api

npm install

cp .env.example .env


npm run db:setup


npm start

API Endpoints
Add School

POST /addSchool

Example Request:

{
  "name": "Green Valley School",
  "address": "Pune",
  "latitude": 18.5204,
  "longitude": 73.8567
}
List Schools

GET /listSchools?latitude=18.5204&longitude=73.8567

Returns schools sorted by nearest distance.

