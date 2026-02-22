
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db'); // Import the database connection pool
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const app = express();


app.use(express.json()); // Allows server to read JSON data
app.use(cors()); // Allows Vite frontend to talk to server

app.get('/', (req, res) => {
  res.send("Backend is officially LIVE!");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

//define POST ENDPOINT
//registration
app.post('/register', async (req, res) => {
  try{
    const { username, email, password } = req.body;
    //validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }
    // hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // database insert
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    console.log("User saved to DB:", newUser.rows[0].username);

    //Response
      res.status(201).json({ 
        message: "User registered", 
        user: {id: newUser.rows[0].id, username: newUser.rows[0].username}
      });

  } catch (error) {
    //if email already exists
    if(error.code === '23505') {
      return res.status(400).json({ error: "Email already exists." });
    }
    console.error(error);
    res.status(500).send("Server error");
  }
});

//login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find the user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    //Compare the typed password with the hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Success, send back the user info (but NOT the password_hash)
    res.json({
      message: "Login successful",
      token: token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//post workouts
app.post('/workouts', async (req, res) => {
    const { user_id, exercise_name, sets, reps, weight_lbs } = req.body;
    const newWorkout = await pool.query(
        "INSERT INTO workouts (user_id, exercise_name, sets, reps, weight_lbs) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [user_id, exercise_name, sets, reps, weight_lbs]
    );
    res.json(newWorkout.rows[0]);
});
//read all workouts FOR LOGGED IN USER
app.get('/workouts/:userId', async (req, res) => {
    const { userId } = req.params;
    const allWorkouts = await pool.query(
        "SELECT * FROM workouts WHERE user_id = $1 ORDER BY created_at DESC", 
        [userId]
    );
    res.json(allWorkouts.rows);
});
//update workout
app.put('/workouts/:id', async (req, res) => {
    const { id } = req.params;
    const { exercise_name, sets, reps, weight_lbs } = req.body;
    await pool.query(
        "UPDATE workouts SET exercise_name = $1, sets = $2, reps = $3, weight_lbs = $4 WHERE id = $5",
        [exercise_name, sets, reps, weight_lbs, id]
    );
    res.json("Workout was updated!");
});
//delete workout
app.delete('/workouts/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM workouts WHERE id = $1", [id]);
    res.json("Workout was deleted!");
});
//get default exercises
app.get('/exercises', async (req, res) => {
    try {
        const allExercises = await pool.query("SELECT * FROM exercises ORDER BY name ASC");
        res.json(allExercises.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
//PRs
app.get('/personal-records/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const prs = await pool.query(
            `SELECT exercise_name, MAX(weight_lbs) as max_weight, MAX(created_at) as date_set
             FROM workouts 
             WHERE user_id = $1 
             GROUP BY exercise_name`,
            [userId]
        );
        res.json(prs.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.get('/workout-progress/:userId/:exercise', async (req, res) => {
  try {
    const { userId, exercise } = req.params;
    const progress = await pool.query(
      `SELECT DATE(created_at) as date, MAX(weight_lbs) as max_weight 
       FROM workouts 
       WHERE user_id = $1 AND exercise_name = $2 
       GROUP BY DATE(created_at) 
       ORDER BY DATE(created_at) ASC`,
      [userId, exercise]
    );
    res.json(progress.rows);
  } catch (err) {
    console.error(err);
  }
});
//delete
app.delete('/workouts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM workouts WHERE id = $1", [id]);
        res.json("Workout was deleted!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
//authorize
const authorize = (req, res, next) => {
  const token = req.header("token"); // Look for token in the request headers

  if (!token) {
    return res.status(403).json("Access Denied: No Token Provided");
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verify; // Attach the user info to the request
    next(); // Pass control to the next function (the actual route)
  } catch (err) {
    res.status(401).json("Token is not valid");
  }
};
//volume and frequency 
app.get('/stats/:userId', authorize, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 1. Volume per Muscle Group
        const volumeData = await pool.query(
            `SELECT muscle_group, SUM(weight_lbs * reps * sets) as total_volume 
             FROM workouts WHERE user_id = $1 
             GROUP BY muscle_group`, [userId]
        );

        // 2. Workout Frequency (Count by Date)
        const frequencyData = await pool.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM workouts WHERE user_id = $1 
             GROUP BY DATE(created_at)`, [userId]
        );

        res.json({
            volume: volumeData.rows,
            frequency: frequencyData.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});