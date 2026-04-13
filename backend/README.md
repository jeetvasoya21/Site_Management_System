# Construction Site Management Backend

This is the Node.js/Express backend for the Construction Site Management System.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:5000

## API Endpoints

- `GET /api/message` - Returns a hello message from backend
- `POST /api/data` - Accepts JSON data and returns success status

## Integration with Frontend

The frontend is configured with a proxy in `vite.config.js` to forward `/api` requests to the backend.

In React components, you can call the APIs using fetch:

```javascript
// GET request
const response = await fetch('/api/message');
const data = await response.json();

// POST request
const response = await fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ yourData: 'value' }),
});
const data = await response.json();
```

## Running Both Frontend and Backend

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

## Common Issues

1. **CORS Errors**: Make sure CORS is enabled in the backend and the origin is set to `http://localhost:3000`

2. **Port Conflicts**: Ensure backend runs on port 5000 and frontend on 3000

3. **API URLs**: Use relative URLs (`/api/...`) in frontend due to proxy setup, or full URLs (`http://localhost:5000/api/...`) if not using proxy

4. **Connection Refused**: Make sure both servers are running

## Error Handling

- Backend includes try-catch blocks and error middleware
- Frontend includes try-catch for API calls
- Check browser console and server logs for debugging