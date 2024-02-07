require('dotenv').config();

// Load environment variables
const basePort = process.env.PORT|| '3400'; 

// Get the instance index if available
const instanceIndex = process.env.INSTANCE_INDEX ? parseInt(process.env.INSTANCE_INDEX) : 0;

// Dynamically calculate port based on instance index
export const port =  parseInt(basePort,10) + instanceIndex ;