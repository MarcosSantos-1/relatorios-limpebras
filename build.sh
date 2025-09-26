# Vercel Build Configuration
# Force clean install and build

# Install dependencies
npm ci

# Build the project
npm run build:prod

# Verify puppeteer-core is available
echo "Checking puppeteer-core installation..."
ls -la node_modules/puppeteer-core/

# Verify chromium-min is available  
echo "Checking chromium-min installation..."
ls -la node_modules/@sparticuz/chromium-min/
