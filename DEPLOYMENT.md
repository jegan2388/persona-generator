# Deployment Guide

## Backend Deployment (Render.com)

1. Create a new account on [Render.com](https://render.com)

2. Click "New +" and select "Web Service"

3. Connect your GitHub repository

4. Configure the Web Service:
   - Name: `persona-generator-api` (or your preferred name)
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Plan: Free tier

5. Add Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `FLASK_ENV`: `production`
   - `CORS_ORIGIN`: Your frontend URL (after deploying frontend)

## Frontend Deployment (Netlify)

1. Create a new account on [Netlify](https://netlify.com)

2. From the Netlify dashboard, click "Add new site" → "Deploy manually"

3. Drag and drop your `frontend` folder to deploy

4. Configure your site:
   - Go to "Site settings" → "Build & deploy"
   - Set the publish directory to `/`

5. Update API URL:
   - Open `frontend/script.js`
   - Change the API URL to your Render backend URL:
     ```javascript
     const API_URL = 'https://your-render-app.onrender.com/generate-persona';
     ```

## Post-Deployment

1. Test the application by:
   - Visiting your Netlify URL
   - Generating a test persona
   - Checking browser console for any errors

2. Monitor your application:
   - Check Render logs for backend issues
   - Monitor OpenAI API usage
   - Set up uptime monitoring (optional)

## Security Considerations

1. Ensure your OpenAI API key is properly secured
2. Set up proper CORS configuration
3. Consider rate limiting for production use
4. Monitor API usage and costs

## Scaling (Future)

1. Consider adding a database for persona storage
2. Implement caching for frequent requests
3. Add user authentication if needed
4. Set up CDN for better global performance 