// Mock data for POS system
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "all", name: "All", icon: "LayoutGrid" },
  { id: "breakfast", name: "Breakfast", icon: "Coffee" },
  { id: "soups", name: "Soups", icon: "Soup" },
  { id: "pasta", name: "Pasta", icon: "UtensilsCrossed" },
  { id: "main-course", name: "Main Course", icon: "ChefHat" },
  { id: "burgers", name: "Burgers", icon: "Beef" },
];

export const menuItems: MenuItem[] = [
  // Breakfast Items
  {
    id: "1",
    name: "Tasty Vegetable Salad Healthy Diet",
    price: 799,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Fresh mixed vegetables with olive oil dressing",
  },
  {
    id: "2",
    name: "Pancakes with Berries",
    price: 599,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Fluffy pancakes topped with fresh berries and maple syrup",
  },
  {
    id: "3",
    name: "Avocado Toast",
    price: 699,
    category: "breakfast",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Whole grain toast with mashed avocado and poached egg",
  },

  // Soups
  {
    id: "4",
    name: "Tomato Basil Soup",
    price: 399,
    category: "soups",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Creamy tomato soup with fresh basil",
  },
  {
    id: "5",
    name: "Chicken Noodle Soup",
    price: 499,
    category: "soups",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Classic chicken soup with vegetables and noodles",
  },
  {
    id: "6",
    name: "Mushroom Cream Soup",
    price: 449,
    category: "soups",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Rich and creamy mushroom soup",
  },

  // Pasta
  {
    id: "7",
    name: "Spaghetti Carbonara",
    price: 899,
    category: "pasta",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Classic Italian pasta with bacon and creamy sauce",
  },
  {
    id: "8",
    name: "Penne Arrabbiata",
    price: 799,
    category: "pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Spicy tomato sauce with garlic and red chili",
  },
  {
    id: "9",
    name: "Fettuccine Alfredo",
    price: 849,
    category: "pasta",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Creamy white sauce with parmesan cheese",
  },

  // Main Course
  {
    id: "10",
    name: "Grilled Chicken Steak",
    price: 1299,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Juicy grilled chicken with herbs and vegetables",
  },
  {
    id: "11",
    name: "Beef Steak with Vegetables",
    price: 1599,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Premium beef steak with roasted vegetables",
  },
  {
    id: "12",
    name: "Grilled Salmon",
    price: 1499,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Fresh salmon fillet with lemon butter sauce",
  },
  {
    id: "13",
    name: "Vegetable Stir Fry",
    price: 699,
    category: "main-course",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Mixed vegetables in Asian-style sauce",
  },

  // Burgers
  {
    id: "14",
    name: "Classic Beef Burger",
    price: 899,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Juicy beef patty with cheese, lettuce, and tomato",
  },
  {
    id: "15",
    name: "Chicken Burger",
    price: 799,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Grilled chicken breast with special sauce",
  },
  {
    id: "16",
    name: "Veggie Burger",
    price: 699,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop",
    isVeg: true,
    description: "Plant-based patty with fresh vegetables",
  },
  {
    id: "17",
    name: "Double Cheese Burger",
    price: 1099,
    category: "burgers",
    image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
    isVeg: false,
    description: "Two beef patties with double cheese",
  },
];

export interface ActiveOrder {
  id: string;
  tableNumber: string;
  customerName: string;
  itemCount: number;
  status: string;
}

export const activeOrders: ActiveOrder[] = [
  {
    id: "ord1",
    tableNumber: "T1",
    customerName: "Jacob Jones",
    itemCount: 6,
    status: "Kitchen Processing",
  },
  {
    id: "ord2",
    tableNumber: "T2",
    customerName: "Bessie Cooper",
    itemCount: 4,
    status: "Kitchen",
  },
  {
    id: "ord3",
    tableNumber: "T3",
    customerName: "Ralph Edwards",
    itemCount: 5,
    status: "Kitchen",
  },
];
