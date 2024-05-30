const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const base64 = require('base-64');
const symptomsDictionary = require('./symptom'); // Ensure the correct path

// Load environment variables from .env file
dotenv.config();

const fetch = import('node-fetch')

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const username = process.env.APIMEDIC_USER;
const encodedPassword = process.env.APIMEDIC_PASSWORD;
const token = process.env.AUTH_TOKEN;
let symptoms = new Map();

if (!username || !encodedPassword) {
    console.error('Error: APIMEDIC_USER and APIMEDIC_PASSWORD environment variables must be set');
    process.exit(1);
}

console.log(`Username: ${username}`);
console.log(`Encoded Password: ${encodedPassword ? 'Set' : 'Not Set'}`);

// Function to validate age
function isValidAge(ageString) {
    // Check if the string is a valid age (non-negative integer)
    const age = parseInt(ageString);
    return Number.isInteger(age) && age >= 0;
}

// Function to validate gender (male/female)
function isValidGender(gender) {
    const lowerCaseGender = gender.toLowerCase();
    return lowerCaseGender === 'male' || lowerCaseGender === 'female';
}

// Function to fetch symptoms based on the provided parameters
async function getSymptoms(symptomsDictionary, gender, age, token) {
    try {
        const response = await axios.get(`https://healthservice.priaid.ch/symptoms`, {
            params: {
                symptomsDictionary: symptomsDictionary,
                gender: gender,
                age: age,
                token: token,
                format: 'json',
                language: 'en-gb'
            }
        });
        console.log('Symptoms fetched successfully');
        return response.data;
    } catch (error) {
        console.error('Error fetching symptoms:', error.response ? error.response.data : error.message);
        return [];
    }
}

// USSD endpoint
app.post('/ussd', async (req, res) => {
    console.log(req.body);

    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    // Ensure text is not null or undefined by initializing it with an empty string and trimming whitespace
    const sanitizedText = (text || '').trim();

    console.log(`Sanitized text: '${sanitizedText}'`);

    let response = '';

    if (sanitizedText === '') {
        // This is the first request. Prompt for age
        response = `CON Welcome to Offline Symptom Checker.\nPlease enter your Age:`;
    } else if (sanitizedText.indexOf('*') === -1) {
        // Validate age
        if (isValidAge(sanitizedText)) {
            // Proceed to ask for gender
            response = `CON Please enter your gender (male/female):`;
        } else {
            // Invalid age format
            response = `CON Invalid Age format. Please enter your Age:`;
        }
    } else if (sanitizedText.split('*').length === 2) {
        // Validate gender
        const [age, gender] = sanitizedText.split('*');
        if (isValidAge(age) && isValidGender(gender)) {
            // Proceed to ask for symptom
            response = `CON Please enter your symptom:`;
        } else {
            // Invalid gender
            response = `CON Invalid gender. Please enter your gender (male/female):`;
        }
    } else if (sanitizedText.split('*').length === 3) {
        // Request for symptom
        const [age, gender, symptomName] = sanitizedText.split('*');
        if (isValidAge(age) && isValidGender(gender)) {
            // Look up the symptom ID from the symptom dictionary
            const symptomId = symptomsDictionary[symptomName.toLowerCase()];

            if (symptomId) {
                // Fetch symptoms data based on the provided parameters
                try {
                    const symptomsData = await getSymptoms(symptomId, gender, age, token);
                    if (symptomsData.length > 0) {
                        // Extract symptom name from symptomsData
                        const matchedSymptom = symptomsData[0].Name;

                        // Process symptomsData to find matching symptom and diseases
                        // Construct response accordingly
                        response = `END Symptom: ${matchedSymptom}\nAssociated Diseases: <list of diseases>`;
                    } else {
                        response = 'END No matching symptoms found.';
                    }
                } catch (error) {
                    console.error('Error retrieving symptom data:', error.message);
                    response = 'END Sorry, we couldn\'t retrieve symptom information at the moment. Please try again later.';
                }
            } else {
                response = 'END Symptom not found. Please try again with a different symptom.';
            }
        } else {
            response = `CON Invalid parameters. Please try again.`;
        }
    } else {
        // Default case for invalid options
        response = 'END Invalid option. Please try again.';
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
