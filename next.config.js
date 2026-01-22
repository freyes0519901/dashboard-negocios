/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'https://freyes0519901.pythonanywhere.com'
  }
}

module.exports = nextConfig
