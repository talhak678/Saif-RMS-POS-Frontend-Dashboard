// Mock Data for Reports Dashboard

export const analyticsData = {
  salesTrend: {
    daily: [
      { date: "Jan 27", sales: 4500, orders: 45 },
      { date: "Jan 28", sales: 5200, orders: 52 },
      { date: "Jan 29", sales: 4800, orders: 48 },
      { date: "Jan 30", sales: 6100, orders: 61 },
      { date: "Jan 31", sales: 5500, orders: 55 },
      { date: "Feb 1", sales: 7200, orders: 72 },
      { date: "Feb 2", sales: 6800, orders: 68 },
    ],
    weekly: [
      { date: "Week 1", sales: 28000, orders: 280 },
      { date: "Week 2", sales: 32000, orders: 320 },
      { date: "Week 3", sales: 35000, orders: 350 },
      { date: "Week 4", sales: 38000, orders: 380 },
    ],
    monthly: [
      { date: "Sep", sales: 120000, orders: 1200 },
      { date: "Oct", sales: 135000, orders: 1350 },
      { date: "Nov", sales: 142000, orders: 1420 },
      { date: "Dec", sales: 158000, orders: 1580 },
      { date: "Jan", sales: 165000, orders: 1650 },
    ],
  },
  summary: {
    payments: {
      total: 42500,
      change: 12.5,
      breakdown: [
        { method: "Cash", amount: 15000, percentage: 35 },
        { method: "Card", amount: 20000, percentage: 47 },
        { method: "Online", amount: 7500, percentage: 18 },
      ],
    },
    revenue: {
      total: 38250,
      change: 8.3,
      netProfit: 12500,
    },
    tips: {
      total: 2850,
      change: 15.2,
      averagePerOrder: 8.5,
    },
  },
};

export const ordersCustomersData = {
  orderSource: [
    { name: "Dine-in", value: 65, color: "#FF6B35" },
    { name: "Delivery", value: 35, color: "#6366F1" },
  ],
  customerType: [
    { name: "Returning", value: 72, color: "#8B5CF6" },
    { name: "New", value: 28, color: "#F7931E" },
  ],
  customerLocations: [
    { area: "Downtown", orders: 450 },
    { area: "North Side", orders: 380 },
    { area: "East End", orders: 320 },
    { area: "West Hills", orders: 280 },
    { area: "South Bay", orders: 240 },
  ],
};

export const inventoryData = {
  stockConsumption: [
    { ingredient: "Chicken", consumed: 250, unit: "kg" },
    { ingredient: "Tomatoes", consumed: 180, unit: "kg" },
    { ingredient: "Cheese", consumed: 150, unit: "kg" },
    { ingredient: "Flour", consumed: 120, unit: "kg" },
    { ingredient: "Beef", consumed: 100, unit: "kg" },
  ],
  recipePopularity: [
    { recipe: "Margherita Pizza", orders: 320, revenue: 4800 },
    { recipe: "Chicken Burger", orders: 285, revenue: 4275 },
    { recipe: "Caesar Salad", orders: 245, revenue: 2450 },
    { recipe: "Pasta Carbonara", orders: 220, revenue: 3300 },
    { recipe: "Grilled Chicken", orders: 195, revenue: 2925 },
  ],
};

export const branchesData = {
  salesPerBranch: [
    { branch: "Main Street", sales: 45000, orders: 450, growth: 12 },
    { branch: "Downtown", sales: 38000, orders: 380, growth: 8 },
    { branch: "Mall Plaza", sales: 42000, orders: 420, growth: 15 },
    { branch: "Airport", sales: 35000, orders: 350, growth: -3 },
    { branch: "Beach Side", sales: 28000, orders: 280, growth: 5 },
  ],
};

export const menuCategoriesData = {
  salesByCategory: [
    { category: "Pizza", value: 35, sales: 15750, color: "#FF6B35" },
    { category: "Burgers", value: 25, sales: 11250, color: "#F7931E" },
    { category: "Salads", value: 15, sales: 6750, color: "#6366F1" },
    { category: "Pasta", value: 20, sales: 9000, color: "#8B5CF6" },
    { category: "Desserts", value: 5, sales: 2250, color: "#EC4899" },
  ],
  topSellingItems: [
    { item: "Margherita Pizza", sales: 4800, orders: 320 },
    { item: "Chicken Burger", sales: 4275, orders: 285 },
    { item: "Pasta Carbonara", sales: 3300, orders: 220 },
    { item: "Grilled Chicken", sales: 2925, orders: 195 },
    { item: "Caesar Salad", sales: 2450, orders: 245 },
    { item: "Pepperoni Pizza", sales: 2400, orders: 160 },
    { item: "Beef Burger", sales: 2250, orders: 150 },
    { item: "Tiramisu", sales: 1800, orders: 120 },
  ],
};
