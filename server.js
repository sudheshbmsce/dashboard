const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

const apiUrlTargets = 'https://www.tesults.com/api/targets';
const apiUrlResults = 'https://www.tesults.com/api/results';
const apiUrlZephyrTestCases = 'https://api.zephyrscale.smartbear.com/v2/testcases';
const apiUrlZephyrFolders = 'https://api.zephyrscale.smartbear.com/v2/folders';
const apiUrlZephyrTestCycles = 'https://api.zephyrscale.smartbear.com/v2/testcycles';
const apiUrlZephyrExecutions = 'https://api.zephyrscale.smartbear.com/v2/testexecutions';
const tokenTesults = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjNjN2U4MGIxLWIxODItNDRiYi04MGMyLWE0Njc5NDdhYmE5MyIsImV4cCI6NDEwMjQ0NDgwMDAwMCwidmVyIjoiMCIsInNlcyI6ImYxOGY3M2FmLTM1ZmMtNDRjMy1hMTIyLTJkZmVlNmMwY2U5MCIsInR5cGUiOiJhcCJ9._8iFBB5uKPtnCJZCsjBOwXND_NoxaJesu5mZyC_Gb6w';
const tokenZephyr = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2hpbmdlaGVhbHRoLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjcxMjAyMDo3MGE5MDcxYy00N2ZkLTRmZTUtOGY5Ni1jNjliYTViNjhhYzcifX0sImlzcyI6ImNvbS5rYW5vYWgudGVzdC1tYW5hZ2VyIiwic3ViIjoiamlyYTphYjBkOWIzNy1mNzMzLTQyYmMtOWRkYi1kMWJjMjA3M2RmMTAiLCJleHAiOjE3Mzk4MTE4NDIsImlhdCI6MTcwODI3NTg0Mn0._Hyk3vkTw-gxCXgUs2dco5NE1hdo3PMtbloFBZj8gdU';

app.use(cors());

app.get('/api/targets', async (req, res) => {
    try {
        console.log('Fetching targets from Tesults API...');
        const response = await axios.get(apiUrlTargets, {
            headers: {
                'Authorization': tokenTesults
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching targets:', error.message);
        res.status(500).send('Error fetching targets: ' + error.message);
    }
});

app.get('/api/results', async (req, res) => {
    const targetId = req.query.target;
    try {
        console.log('Fetching results from Tesults API...');
        const response = await axios.get(`${apiUrlResults}?analysis=true&target=${targetId}&cases=false`, {
            headers: {
                'Authorization': tokenTesults
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching results:', error.message);
        res.status(500).send('Error fetching results: ' + error.message);
    }
});

app.get('/api/zephyr/testcases', async (req, res) => {
    const maxResults = req.query.maxResults || 1;
    const folderId = req.query.folderId;
    try {
        console.log('Fetching test cases from Zephyr API...');
        const response = await axios.get(apiUrlZephyrTestCases, {
            headers: {
                'Authorization': tokenZephyr
            },
            params: {
                projectKey: 'QE',
                maxResults: maxResults,
                folderId: folderId
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching test cases:', error.message);
        res.status(500).send('Error fetching test cases: ' + error.message);
    }
});

app.get('/api/zephyr/folders', async (req, res) => {
    try {
        console.log('Fetching folders from Zephyr API...');
        const response = await axios.get(apiUrlZephyrFolders, {
            headers: {
                'Authorization': tokenZephyr
            },
            params: {
                maxResults: 1000,
                projectKey: 'QE',
                folderType: 'TEST_CASE'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching folders:', error.message);
        res.status(500).send('Error fetching folders: ' + error.message);
    }
});
app.get('/api/test-cycles', async (req, res) => {
    const folderId = req.query.folderId || '18239837'; // Default folder ID if not provided
    try {
        console.log('Fetching test cycles from Zephyr API...');
        const response = await axios.get(apiUrlZephyrTestCycles, {
            headers: {
                'Authorization': tokenZephyr
            },
            params: {
                folderId: folderId,
                maxResults: 1000
            }
        });
        const testCycles = response.data.values || [];

        // Initialize counters
        let automatedCount = 0;
        let nonAutomatedCount = 0;

        for (const cycle of testCycles) {
            // Fetch test executions for each test cycle
            const executionsResponse = await axios.get(apiUrlZephyrExecutions, {
                headers: {
                    'Authorization': tokenZephyr
                },
                params: {
                    testCycle: cycle.key,
                    maxResults: 1000
                }
            });

            // Count automated and non-automated executions
            executionsResponse.data.values.forEach(execution => {
                if (execution.automated) {
                    automatedCount++;
                } else {
                    nonAutomatedCount++;
                }
            });
        }

        // Respond with total counts
        res.json({ automated: automatedCount, nonAutomated: nonAutomatedCount });
    } catch (error) {
        console.error('Error fetching test cycles or executions:', error.message);
        res.status(500).send('Error fetching test cycles or executions: ' + error.message);
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
