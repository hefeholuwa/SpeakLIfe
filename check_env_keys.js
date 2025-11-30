require('dotenv').config();

const keys = Object.keys(process.env);
const relevantKeys = keys.filter(k => k.includes('SUPABASE') || k.includes('DB') || k.includes('DATABASE'));

console.log('Available Environment Variables:', relevantKeys);
