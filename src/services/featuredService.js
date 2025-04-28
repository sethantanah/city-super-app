const { getFeaturedJobs } = require('./jobService');
// Import other services as they're created
// const { getFeaturedListings } = require('./marketplaceService');
// const { getFeaturedEvents } = require('./eventService');

/**
 * Get featured items from all services
 * @param {number} limit - Maximum number of items to return per service
 * @returns {Promise<Array>} Promise resolving to array of featured items
 */
async function getAllFeaturedItems(limit = 1) {
  try {
    // Fetch featured items from each service
    const featuredJobs = await getFeaturedJobs(limit);
    
    // Mock data for marketplace and events until those services are implemented
    // const featuredMarketplace = [
    //   {
    //     id: 'market1',
    //     title: 'Vintage Leather Chair',
    //     subtitle: '$120 • Downtown • Like New',
    //     imageUrl: '/images/sample-item.jpg',
    //     type: 'Marketplace',
    //     color: 'green',
    //     icon: 'shopping-bag',
    //     link: '/thrift/market1'
    //   }
    // ];
    
    // const featuredEvents = [
    //   {
    //     id: 'event1',
    //     title: 'Community Festival',
    //     subtitle: 'This Weekend • City Park • Free',
    //     imageUrl: '/images/sample-event.jpg',
    //     type: 'Event',
    //     color: 'purple',
    //     icon: 'calendar',
    //     link: '/events/event1'
    //   }
    // ];
    
    // Transform job data to match the component format
    const formattedJobs = featuredJobs.map(job => ({
      id: job.id,
      title: job.title,
      subtitle: `${job.type} • ${job.salary} • ${job.location}`,
      type: 'Job',
      color: 'blue',
      icon: 'briefcase',
      link: `/jobs/details/${job.id}`
    }));
    
    // Combine all featured items
    const allFeatured = [
      ...formattedJobs,
      // ...featuredMarketplace,
      // ...featuredEvents
    ];
    
    return allFeatured;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}

/**
 * Get featured items for a specific section of the homepage
 * @param {string} section - Section name ('jobs', 'marketplace', 'events')
 * @param {number} limit - Maximum number of items to return
 * @returns {Promise<Array>} Promise resolving to array of featured items
 */
async function getFeaturedItemsBySection(section, limit = 3) {
  try {
    switch (section) {
      case 'jobs':
        const jobs = await getFeaturedJobs(limit);
        return jobs.map(job => ({
          id: job.id,
          title: job.title,
          subtitle: `${job.type} • ${job.salary} • ${job.location}`,
          type: 'Job',
          color: 'blue',
          icon: 'briefcase',
          link: `/jobs/${job.id}`
        }));
        
      case 'marketplace':
        // Mock data until marketplace service is implemented
        return [
          {
            id: 'market1',
            title: 'Vintage Leather Chair',
            subtitle: '$120 • Downtown • Like New',
            imageUrl: '/images/sample-item.jpg',
            type: 'Marketplace',
            color: 'green',
            icon: 'shopping-bag',
            link: '/thrift/market1'
          },
          {
            id: 'market2',
            title: 'Mountain Bike',
            subtitle: '$350 • Westside • Good Condition',
            imageUrl: '/images/sample-bike.jpg',
            type: 'Marketplace',
            color: 'green',
            icon: 'shopping-bag',
            link: '/thrift/market2'
          },
          {
            id: 'market3',
            title: 'iPhone 12 Pro',
            subtitle: '$600 • Eastside • Like New',
            imageUrl: '/images/sample-phone.jpg',
            type: 'Marketplace',
            color: 'green',
            icon: 'shopping-bag',
            link: '/thrift/market3'
          }
        ];
        
      case 'events':
        // Mock data until events service is implemented
        return [
          {
            id: 'event1',
            title: 'Community Festival',
            subtitle: 'This Weekend • City Park • Free',
            imageUrl: '/images/sample-event.jpg',
            type: 'Event',
            color: 'purple',
            icon: 'calendar',
            link: '/events/event1'
          },
          {
            id: 'event2',
            title: 'Farmers Market',
            subtitle: 'Every Saturday • Downtown • Free',
            imageUrl: '/images/sample-market.jpg',
            type: 'Event',
            color: 'purple',
            icon: 'calendar',
            link: '/events/event2'
          },
          {
            id: 'event3',
            title: 'Tech Meetup',
            subtitle: 'Next Tuesday • Innovation Hub • $5',
            imageUrl: '/images/sample-meetup.jpg',
            type: 'Event',
            color: 'purple',
            icon: 'calendar',
            link: '/events/event3'
          }
        ];
        
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching featured ${section}:`, error);
    return [];
  }
}

module.exports = {
  getAllFeaturedItems,
  getFeaturedItemsBySection
};
