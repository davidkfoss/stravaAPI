import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
app.use(cors());

let access_token = "oi"

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
        res.redirect(`http://localhost:5173/stats/?access_token=${tokenData.access_token}`);
    } catch (error) {
        console.error('Error exchanging token:', error);
        res.status(500).send('Error exchanging token');
    }
});

app.get('/workout_data', async (req, res) => {
    try {
        const accessToken = req.query.access_token;

        const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const workouts = response.data;
        res.send(workouts);
        console.log(workouts);
    } catch (error) {
        console.error('Error fetching workout data:', error);
        res.status(500).send('Error fetching workout data');
    }
});

app.get('/athlete', async (req, res) => {
    try {
        const accessToken = req.query.access_token;
        const response = await axios.get('https://www.strava.com/api/v3/athlete', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const athlete = response.data;
        res.send(athlete);
    }
    catch (error) {
        console.error('Error fetching athlete data:', error);
        res.status(500).send('Error fetching athlete data');
    }
});

app.get('/zones', async (req, res) => {
    try {
        const accessToken = req.query.access_token;
        const response = await axios.get('https://www.strava.com/api/v3/athlete/zones', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const zones = response.data;
        res.send(zones);
    }
    catch (error) {
        console.error('Error fetching athlete data:', error);
        res.status(500).send('Error fetching athlete data');
    }
});

app.get('/stats', async (req, res) => {
    try {
        const accessToken = req.query.access_token;
        const id = req.query.id;
        const response = await axios.get(`https://www.strava.com/api/v3/athlete/${id}/stats`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const stats = response.data;
        res.send(stats);
    }
    catch (error) {
        console.error('Error fetching athlete data:', error);
        res.status(500).send('Error fetching athlete data');
    }
});

app.get('/comments', async (req, res) => {
    try {
        const accessToken = req.query.access_token;
        const id = req.query.id;
        const response = await axios.get(`https://www.strava.com/api/v3/activities/${id}/comments`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const stats = response.data;
        res.send(stats);
    }
    catch (error) {
        console.error('Error fetching athlete data:', error);
        res.status(500).send('Error fetching athlete data');
    }
});

app.get('/kudos', async (req, res) => {
    try {
        const accessToken = req.query.access_token;
        const id = req.query.id;
        const response = await axios.get(`https://www.strava.com/api/v3/activities/${id}/kudos`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const stats = response.data;
        res.send(stats);
    }
    catch (error) {
        console.error('Error fetching athlete data:', error);
        res.status(500).send('Error fetching athlete data');
    }
});


// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

