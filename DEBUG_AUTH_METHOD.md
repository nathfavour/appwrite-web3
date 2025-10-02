# 🐛 Debugging Authentication Method Selection

## Issue
Set `NEXT_PUBLIC_APPWRITE_AUTH_METHOD=function` but authentication still uses Next.js API route (no executions in Appwrite console).

---

## ✅ Solution Steps

### 1. Ensure Environment File is `.env.local` (Not `.env`)

Next.js prioritizes `.env.local` over `.env`:

```bash
# Copy your settings to .env.local
cp .env .env.local

# Or create it directly
cat > .env.local << 'EOF'
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
APPWRITE_API=your-api-key

# Set auth method to function
NEXT_PUBLIC_APPWRITE_AUTH_METHOD=function
NEXT_PUBLIC_APPWRITE_FUNCTION_ID=your-function-id
