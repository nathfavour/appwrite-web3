// Test script to verify environment variables
console.log('Environment Variables Test:');
console.log('===========================');
console.log('NEXT_PUBLIC_APPWRITE_AUTH_METHOD:', process.env.NEXT_PUBLIC_APPWRITE_AUTH_METHOD);
console.log('NEXT_PUBLIC_APPWRITE_FUNCTION_ID:', process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID);
console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('NEXT_PUBLIC_APPWRITE_PROJECT:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
console.log('===========================');

// Simulate the factory logic
const method = process.env.NEXT_PUBLIC_APPWRITE_AUTH_METHOD?.toLowerCase();
console.log('\nFactory Logic:');
console.log('method (lowercase):', method);
console.log('Will use:', method === 'function' ? 'Appwrite Function' : 'Next.js API');
