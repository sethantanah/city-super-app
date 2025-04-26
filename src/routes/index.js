const express = require('express');
const router = express.Router();
const { getAllFeaturedItems, getFeaturedItemsBySection } = require('../services/featuredService');

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    // Get featured items for the homepage
    const featuredItems = await getAllFeaturedItems(3);
    
    // Get featured jobs specifically for the jobs section
    const featuredJobs = await getFeaturedItemsBySection('jobs', 3);


    const services = [
      { 
        id: 'jobs', 
        name: 'Job Board', 
        description: 'Find your next opportunity or post job openings',
        icon: 'briefcase',
        color: 'bg-blue-500'
      },
      { 
        id: 'billboards', 
        name: 'Billboard Market', 
        description: 'Advertise or find local advertisements',
        icon: 'megaphone',
        color: 'bg-yellow-500'
      },
      { 
        id: 'thrift', 
        name: 'Thrift Store', 
        description: 'Buy and sell second-hand items at great prices',
        icon: 'shopping-bag',
        color: 'bg-green-500'
      },
      { 
        id: 'events', 
        name: 'Local Events', 
        description: 'Discover what\'s happening in your city',
        icon: 'calendar',
        color: 'bg-purple-500'
      },
      { 
        id: 'services', 
        name: 'Services Directory', 
        description: 'Find local services from plumbing to tutoring',
        icon: 'wrench',
        color: 'bg-red-500'
      },
      { 
        id: 'housing', 
        name: 'Housing', 
        description: 'Apartments, houses, and rooms for rent or sale',
        icon: 'home',
        color: 'bg-indigo-500'
      }
    ];
    
    res.render('index', { 
      title: 'City Platform - Your Community Hub',
      activeTab: 'home',
      featuredItems,
      featuredJobs,
      services
    });
  } catch (error) {
    console.error('Error in home route:', error);
    res.status(500).render('error', { 
      message: 'Failed to load homepage',
      error: { status: 500, stack: process.env.NODE_ENV === 'development' ? error.stack : '' }
    });
  }
});

module.exports = router;

