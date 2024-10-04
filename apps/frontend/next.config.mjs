/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'dist',
    reactStrictMode: false, // runs `useEffect` only once, 
                            // we'll need to set this to true when launching to production
};

export default nextConfig;
