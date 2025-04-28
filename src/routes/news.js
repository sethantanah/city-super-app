import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

const router = express.Router();

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Main page route
router.get('/', (req, res) => {
    res.render('news/index', {
        title: 'Local News & Weather',
        location: null,
    });
});

// Fetch data route
router.post('/fetch-data', async (req, res) => {
    const location = req.body.location || 'Accra, Ghana';
    let weatherData = null;
    let newsData = null;
    let aiInsights = null;
    let categories = null;
    let featuredStories = null;
    const errors = [];

    try {
        // Fetch Weather from WeatherAPI
        try {
            const weatherRes = await axios.get(
                `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${location}`
            );
            weatherData = weatherRes.data;
        } catch (weatherError) {
            errors.push('Failed to fetch weather data.');
            console.error('WeatherAPI Error:', weatherError.message);
        }

        // Fetch News from SerpApi
        try {
            const newsRes = await axios.get('https://serpapi.com/search', {
                params: {
                    q: `news ${location}`,
                    api_key: process.env.SERPAPI_KEY,
                    num: 15,
                },
            });
            newsData = newsRes.data.organic_results || [];
            // Select top 3 stories as featured
            featuredStories = newsData.slice(0, 3);
        } catch (newsError) {
            errors.push('Failed to fetch news data.');
            console.error('SerpApi Error:', newsError.message);
        }

        // Categorize news and generate AI insights
        if (newsData || weatherData) {
            const aiResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful assistant that summarizes location-based information and categorizes news. 
                        - If news data is available, categorize articles into topics (e.g., Politics, Sports, Culture, Business) based on their content.
                        - If weather or news data is missing, provide a fallback response explaining the issue and offering general insights about the location.
                        - Include date and time sensitivity in your summary (current date: ${new Date().toISOString()}).
                        - Return a JSON object with: 
                          - summary: A concise summary of available data
                          - categories: An object mapping categories to arrays of article indices`,
                    },
                    {
                        role: 'user',
                        content: `Location: ${location}\nWeather: ${
                            weatherData ? JSON.stringify(weatherData) : 'Not available'
                        }\nNews: ${
                            newsData ? JSON.stringify(newsData) : 'Not available'
                        }\nErrors: ${errors.join(' ')}`,
                    },
                ],
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'get_weather',
                            description: 'Get current weather for a location',
                            parameters: {
                                type: 'object',
                                properties: { location: { type: 'string' } },
                                required: ['location'],
                            },
                        },
                    },
                    {
                        type: 'function',
                        function: {
                            name: 'search_web',
                            description: 'Search the web for news',
                            parameters: {
                                type: 'object',
                                properties: { query: { type: 'string' } },
                                required: ['query'],
                            },
                        },
                    },
                ],
                response_format: { type: 'json_object' },
            });

            const aiContent = JSON.parse(aiResponse.choices[0].message.content);
            aiInsights = aiContent.summary;
            categories = aiContent.categories || {};
        } else {
            // Fallback if both APIs fail
            const aiResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Both weather and news APIs failed. Provide a general overview of the location, including cultural or historical insights, and mention the current date.',
                    },
                    {
                        role: 'user',
                        content: `Location: ${location}\nCurrent Date: ${new Date().toISOString()}`,
                    },
                ],
            });
            aiInsights = aiResponse.choices[0].message.content;
        }

        res.json({
            weather: weatherData,
            news: newsData,
            featuredStories,
            categories,
            aiInsights,
            errors,
        });
    } catch (error) {
        console.error('General Error:', error);
        res.status(500).json({
            errors: ['An unexpected error occurred. Please try again.'],
        });
    }
});

export default router;