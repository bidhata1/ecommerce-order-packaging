const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//// Initialize Express app
const app = express();

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());
// Use CORS middleware to allow cross-origin requests
app.use(cors());


// List of products with name, price, and weight
const products = [
  { name: "Item 1", price: 10, weight: 200 },
  { name: "Item 2", price: 100, weight: 20 },
  { name: "Item 3", price: 30, weight: 300 },
  { name: "Item 4", price: 20, weight: 500 },
  { name: "Item 5", price: 30, weight: 250 },
  { name: "Item 6", price: 40, weight: 10 },
  { name: "Item 7", price: 200, weight: 10 },
  { name: "Item 8", price: 120, weight: 500 },
  { name: "Item 9", price: 130, weight: 790 },
  { name: "Item 10", price: 20, weight: 100 }
  // add other products here...
];
// Courier charges based on maximum weight
const courierCharges = [
  { maxWeight: 200, price: 5 },
  { maxWeight: 500, price: 10 },
  { maxWeight: 1000, price: 15 },
  { maxWeight: 5000, price: 20 }
];

function getCourierPrice(weight) {
  for (let i = 0; i < courierCharges.length; i++) {
    if (weight <= courierCharges[i].maxWeight) {
      return courierCharges[i].price;
    }
  }
  return 20; // Default price if weight exceeds 5000g
}
// Function to optimize packages based on the selected items
function optimizePackages(items) {
     // Sort items by price in descending order
  items.sort((a, b) => b.price - a.price);

   // Initialize packages array and current package object
  let packages = [];
  let currentPackage = { items: [], totalWeight: 0, totalPrice: 0 };

  // Iterate through each item
  items.forEach(item => {
     // If adding the item exceeds the $250 limit, push the current package to packages
    if (currentPackage.totalPrice + item.price > 250) {
      packages.push(currentPackage);
      currentPackage = { items: [], totalWeight: 0, totalPrice: 0 };
    }
    currentPackage.items.push(item.name);
    currentPackage.totalWeight += item.weight;
    currentPackage.totalPrice += item.price;
  });

  // Push any remaining items in the current package to packages
  if (currentPackage.items.length > 0) {
    packages.push(currentPackage);
  }

    // Map each package to include courier price
  return packages.map(pkg => ({
    items: pkg.items,
    totalWeight: pkg.totalWeight,
    totalPrice: pkg.totalPrice,
    courierPrice: getCourierPrice(pkg.totalWeight)
  }));
}

// Define POST endpoint to place an order
app.post('/place-order', (req, res) => {
  try {
    console.log('Request received:', req.body);

    const selectedItems = req.body.items.map(itemName => {
      const product = products.find(product => product.name === itemName);
      if (!product) {
        throw new Error(`Product not found: ${itemName}`);
      }
      return product;
    });

    console.log('Selected items:', selectedItems);

    const packages = optimizePackages(selectedItems);
    console.log('Optimized packages:', packages);
// Respond with the packages
    res.json(packages);
  } catch (error) {
    // Handle errors and respond with 500 status
    console.error('Error processing order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set the server to listen on the specified port (default 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
