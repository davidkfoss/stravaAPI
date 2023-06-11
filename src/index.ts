import express from 'express';
import axios from 'axios';
import cors from 'cors';
import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

// Initialize express
const app = express();
app.use(cors());

// Initialize database
const pgp = pgPromise({});
const db = pgp({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Define constants
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/exchange_token';

// Define routes
app.get('/authorize', (req, res) => {
    const url = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=read_all,profile:read_all,activity:read_all`;
    res.redirect(url);
});

app.get('/exchange_token', async (req, res) => {
    const code = req.query.code;

    try {
        const response = await axios.post('https://www.strava.com/oauth/token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            }
        });

        const tokenData = response.data;

        await db.none('INSERT INTO tokens(access_token, refresh_token, expires_at) VALUES($1, $2, $3)', 
            [tokenData.access_token, tokenData.refresh_token, tokenData.expires_at]);

        res.send('Token received and saved');
    } catch (error) {
        console.error('Error exchanging token:', error);
        res.status(500).send('Error exchanging token');
    }
});

app.get('/workout_data', async (req, res) => {
    try {
        const tokenData = await db.one('SELECT * FROM tokens ORDER BY id DESC LIMIT 1');
        const currentTime = Math.floor(Date.now() / 1000);

        let accessToken = tokenData.access_token;
        if (currentTime >= tokenData.expires_at) {
            const response = await axios.post('https://www.strava.com/oauth/token', null, {
                params: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    refresh_token: tokenData.refresh_token,
                    grant_type: 'refresh_token'
                }
            });

            const newTokenData = response.data;

            accessToken = newTokenData.access_token;

            await db.none('INSERT INTO tokens(access_token, refresh_token, expires_at) VALUES($1, $2, $3)', 
                [newTokenData.access_token, newTokenData.refresh_token, newTokenData.expires_at]);
        }

        const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const workouts = response.data;
        res.send(workouts);
    } catch (error) {
        console.error('Error fetching workout data:', error);
        res.status(500).send('Error fetching workout data');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

