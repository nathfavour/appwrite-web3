# 🔧 Modular Authentication System - Usage Guide

**Feature**: Switchable authentication between Next.js API route and Appwrite Function  
**Status**: ✅ Production Ready  
**Backward Compatible**: Yes - existing code continues to work unchanged

---

## 🎯 Overview

This repository now includes a **modular authentication system** that allows you to switch between two authentication methods using a single environment variable:

1. **Default Mode**: Uses Next.js API route (`/api/custom-token`)
2. **Function Mode**: Uses Appwrite Function (serverless)

**Key Benefits**:
- ✅ Zero changes to existing code
- ✅ Switch methods with one environment variable
- ✅ Both methods work independently
- ✅ Clean, modular architecture
- ✅ Type-safe interfaces

---

## 📁 Architecture

```
lib/auth/                           # Modular auth system
├── index.ts                        # Main exports & convenience functions
├── types.ts                        # Shared interfaces
├── factory.ts                      # Provider factory & singleton
├── web3.ts                         # Web3 wallet utilities
└── providers/
    ├── nextjs-api.ts              # Next.js API route provider
    └── appwrite-function.ts       # Appwrite Function provider

app/
├── login/                         # Original login page (unchanged)
├── login-modular/                 # New modular login demo
└── api/custom-token/              # Original API route (unchanged)
```

---

## 🚀 Quick Start

### Method 1: Use Default (Next.js API Route)

**No changes needed!** Everything works as before.

```env
# .env.local (or leave NEXT_PUBLIC_APPWRITE_AUTH_METHOD unset)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
APPWRITE_API=your-api-key

# Optional - explicitly set to default
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=default
```

### Method 2: Switch to Appwrite Function

1. Deploy the function from `ignore1/web3/`
2. Get the function ID from Appwrite Console
3. Update environment variables:

```env
# .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
APPWRITE_API=your-api-key

# Switch to function mode
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=function
NEXT_PUBLIC_APPWRITE_FUNCTION_ID=your-function-id
```

4. Restart your Next.js dev server
5. Done! Authentication now uses the Appwrite Function

---

## 💻 Usage Examples

### Example 1: Using the New Modular System

The simplest way - one function does everything:

```typescript
import { authenticateAndCreateSession } from '@/lib/auth';

async function handleLogin(email: string) {
  try {
    // Automatically uses the configured provider
    // Handles wallet connection, signing, authentication, and session creation
    const user = await authenticateAndCreateSession(email);
    console.log('Logged in as:', user.email);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Example 2: More Control

If you want more control over the flow:

```typescript
import { authenticateWithWeb3, account } from '@/lib/auth';

async function handleLogin(email: string) {
  try {
    // Step 1: Authenticate (returns userId and secret)
    const { userId, secret } = await authenticateWithWeb3(email);
    
    // Step 2: Create session (you control when)
    await account.createSession({ userId, secret });
    
    // Step 3: Get user info
    const user = await account.get();
    console.log('Logged in as:', user.email);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Example 3: Manual Provider Usage

If you need direct access to the provider:

```typescript
import { getAuthProvider, connectWallet, generateAuthMessage, signMessage } from '@/lib/auth';

async function handleLogin(email: string) {
  // Get the configured provider
  const provider = getAuthProvider();
  console.log('Using provider:', provider.getName());
  
  // Manual flow
  const address = await connectWallet();
  const { message, fullMessage } = generateAuthMessage();
  const signature = await signMessage(fullMessage, address);
  
  // Authenticate
  const result = await provider.authenticate({
    email,
    address,
    signature,
    message
  });
  
  return result;
}
```

---

## 🔄 Switching Between Methods

### At Build Time

Set the environment variable and rebuild:

```bash
# Use Next.js API route
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=default npm run build

# Or use Appwrite Function
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=function npm run build
```

### At Development Time

Just change `.env.local` and restart:

```bash
# Edit .env.local
vim .env.local

# Restart dev server
npm run dev
```

### Visual Indicator

The new `/login-modular` page shows which method is active with a colored badge:
- 🟡 **Yellow badge**: Next.js API mode
- 🔵 **Blue badge**: Appwrite Function mode

---

## 📊 Comparison: Original vs Modular

### Original Login Page (`/login`)

```typescript
// Hard-coded to use fetch('/api/custom-token')
const res = await fetch('/api/custom-token', {
  method: 'POST',
  body: JSON.stringify({ email, address, signature, message })
});
```

**Status**: ✅ Unchanged - still works exactly as before

### Modular Login Page (`/login-modular`)

```typescript
// Automatically uses configured provider
await authenticateAndCreateSession(email);
```

**Benefits**:
- Switches methods via environment variable
- Cleaner code (no fetch boilerplate)
- Type-safe interfaces
- Better error handling

---

## 🏗️ Provider Interface

Both providers implement the same interface:

```typescript
interface IAuthProvider {
  authenticate(request: Web3AuthRequest): Promise<Web3AuthResponse>;
  getName(): string;
}
```

### Next.js API Provider

```typescript
class NextJsApiProvider implements IAuthProvider {
  getName() { return 'nextjs-api'; }
  
  async authenticate(request) {
    // Calls /api/custom-token
    const response = await fetch('/api/custom-token', { ... });
    return await response.json();
  }
}
```

### Appwrite Function Provider

```typescript
class AppwriteFunctionProvider implements IAuthProvider {
  getName() { return 'appwrite-function'; }
  
  async authenticate(request) {
    // Calls Appwrite Function via SDK
    const execution = await functions.createExecution(
      functionId,
      JSON.stringify(request),
      false
    );
    return JSON.parse(execution.responseBody);
  }
}
```

---

## 🔐 Security Notes

### API Key Handling

**Default Mode (Next.js API)**:
- API key stored in `APPWRITE_API` (server-side only)
- Never exposed to client
- Used in `/api/custom-token/route.ts`

**Function Mode**:
- API key stored in Appwrite Function environment
- Never exposed to client
- Function ID is public (safe to expose)

Both methods are equally secure - API keys never reach the client.

---

## 🧪 Testing Both Methods

### Test Default Mode

```bash
# .env.local
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=default

# Start dev server
npm run dev

# Visit http://localhost:3000/login-modular
# Should show "🚀 Using Next.js API Route"
```

### Test Function Mode

```bash
# .env.local
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=function
NEXT_PUBLIC_APPWRITE_FUNCTION_ID=your-function-id

# Start dev server
npm run dev

# Visit http://localhost:3000/login-modular
# Should show "✨ Using serverless Appwrite Function"
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Yes | - | Appwrite API endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | Yes | - | Appwrite project ID |
| `APPWRITE_API` | Yes | - | Server-side API key |
| `NEXT_PUBLIC_APPWRITE_AUTH_METHOD` | No | `default` | Auth method: `default` or `function` |
| `NEXT_PUBLIC_APPWRITE_FUNCTION_ID` | Conditional | - | Required when method is `function` |

---

## 🎨 Demo Pages

### Original Pages (Unchanged)

- `/login` - Original login page (hard-coded to API route)
- `/` - Dashboard (unchanged)
- `/logout` - Logout handler (unchanged)

### New Modular Page

- `/login-modular` - Demonstrates switchable authentication
  - Shows visual indicator of active method
  - Uses modular auth system
  - Cleaner code structure

---

## 🚨 Error Handling

The modular system provides clear error messages:

```typescript
try {
  await authenticateAndCreateSession(email);
} catch (error) {
  // Errors are descriptive and actionable:
  // - "No wallet found. Please install MetaMask..."
  // - "User rejected signature"
  // - "Email already bound to different wallet"
  // - "Invalid signature"
  console.error(error.message);
}
```

---

## 🔄 Migration Guide

### From Original to Modular

**Before** (in any component):
```typescript
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
const address = accounts[0];
const message = `auth-${Date.now()}`;
const fullMessage = `Sign this message to authenticate: ${message}`;
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [fullMessage, address]
});

const res = await fetch('/api/custom-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, address, signature, message })
});

const data = await res.json();
if (!res.ok) throw new Error(data.error);

await account.createSession({ userId: data.userId, secret: data.secret });
```

**After** (much simpler):
```typescript
import { authenticateAndCreateSession } from '@/lib/auth';

await authenticateAndCreateSession(email);
```

**Savings**: ~20 lines → 1 line (95% reduction!)

---

## 📚 API Reference

### Main Functions

```typescript
// Complete auth flow (recommended)
authenticateAndCreateSession(email: string): Promise<User>

// Auth without session creation
authenticateWithWeb3(email: string): Promise<{ userId, secret }>

// Get current auth method
getAuthMethod(): 'default' | 'function'

// Get provider instance
getAuthProvider(): IAuthProvider
```

### Utility Functions

```typescript
// Check wallet availability
isWalletAvailable(): Promise<boolean>

// Connect wallet
connectWallet(): Promise<string>

// Generate auth message
generateAuthMessage(): { message: string, fullMessage: string }

// Sign message
signMessage(message: string, address: string): Promise<string>
```

---

## ✅ Best Practices

1. **Use the high-level API**: `authenticateAndCreateSession()` handles everything
2. **Don't hard-code providers**: Always use `getAuthProvider()`
3. **Check console logs**: The system logs which provider it's using
4. **Test both methods**: Ensure your app works with both
5. **Handle errors gracefully**: Wallet interactions can fail in many ways

---

## 🎉 Summary

| Feature | Status |
|---------|--------|
| **Modular architecture** | ✅ Implemented |
| **Provider interface** | ✅ Defined |
| **Next.js API provider** | ✅ Complete |
| **Appwrite Function provider** | ✅ Complete |
| **Factory pattern** | ✅ Implemented |
| **Web3 utilities** | ✅ Extracted |
| **Demo page** | ✅ Created |
| **Backward compatible** | ✅ Yes |
| **Type-safe** | ✅ Fully typed |
| **Production ready** | ✅ Yes |

---

**Status**: ✅ **Ready to Use**  
**Pages**: `/login` (original) and `/login-modular` (new demo)  
**Configuration**: `NEXT_PUBLIC_APPWRITE_AUTH_METHOD` environment variable
