🚀 Sociality

A modern social media web application built with Next.js, TypeScript, and TailwindCSS.
Users can share posts, follow other users, like content, and explore posts in a responsive and interactive interface.

This project demonstrates a production-ready frontend architecture, optimized for performance, scalability, and clean UI/UX.

⸻

🌐 Live Demo

Frontend
https://sociality-eosin.vercel.app/

Backend API
https://be-social-media-api-production.up.railway.app/

API Documentation
https://be-social-media-api-production.up.railway.app/api-swagger

⸻

✨ Features

Authentication
• User registration
• Login with JWT authentication
• Persistent session handling

Feed
• Personalized following feed
• Public explore feed
• Smooth UI transitions

Posts
• Create post with image upload
• Like posts
• Save posts
• Delete your own posts
• Share post links
• Emoji supported comments

Profiles
• User profile page
• Follow / unfollow users
• Post gallery
• Liked posts
• Saved posts
• Edit profile

UI / UX
• Responsive mobile & desktop layout
• Sticky navigation
• Smooth scroll restoration
• Modal-style post viewer
• Tab state persistence

⸻

🧱 Tech Stack

Frontend
• Next.js 14
• React
• TypeScript
• TailwindCSS
• Axios

Image Handling
• Next.js Image Optimization

State & UX
• React Hooks
• SessionStorage state persistence

Deployment
• Vercel (Frontend)
• Railway (Backend API)

⸻

🏗 Architecture

Frontend follows a modular component-based architecture.

```bash
src
 ├── app
 │   ├── (auth)
 │   │   ├── login
 │   │   └── register
 │   │
 │   ├── (main)
 │   │   ├── feed
 │   │   ├── posts
 │   │   └── profile
 │   │
 │   ├── users
 │   │   └── [username]
 │   │
 │   └── add-post
 │
 ├── components
 │   ├── layout
 │   │   ├── BottomBar.tsx
 │   │   ├── Navbar.tsx
 │   │   └── PostCard.tsx
 │   │
 │   └── ui
 │
 ├── lib
 │   ├── api
 │   │   └── axios.ts
 │   │
 │   └── store
 │
 ├── assets
 │   └── svg
 │
 └── types
```

⸻

⚙️ Installation

Clone repository

```bash
https://github.com/Dimas-Denny/sociality.git
```

Enter project folder

```bash
cd sociality
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Open browser

```bash
http://localhost:3000
```

⸻

🔐 Environment Variables

Create a .env.local file

```bash
touch .env.local
```

Add environment variable

```bash
NEXT_PUBLIC_API_URL=https://be-social-media-api-production.up.railway.app
```

⸻

🔌 API Endpoints

Users

```bash
GET /users/{username}
GET /users/{username}/posts
GET /users/{username}/likes
```

Follow

```bash
POST /follow/{username}
DELETE /follow/{username}
```

Posts

```bash
GET /posts
GET /feed
POST /posts
DELETE /posts/{id}
```

Profile

```bash
GET /me
GET /me/posts
GET /me/saved
```

⸻

🖼 Image Handling

Images are optimized using Next.js Image component.

Configure next.config.js:

```js
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**",
    },
  ],
}
```

Invalid image URLs are filtered before rendering to prevent runtime errors.

⸻

📱 Responsive Design

Mobile

```bash
Bottom navigation
Touch optimized layout
```

Desktop

```bash
Centered content column
Modal post viewer
Adaptive spacing
```

⸻

🚀 Deployment

Frontend deployment

```bash
npm run build
```

Deploy using

```bash
Vercel
```

Backend deployment

```bash
Railway
```

⸻

📸 Screenshots

Example:

```bash
![Feed](./screenshots/feed.png)
```

You can include screenshots for:
• Feed Page
• Profile Page
• Post Viewer
• Mobile UI

⸻

📈 Future Improvements

```bash
Notifications system
Real-time updates
Infinite scrolling
Story feature
Dark/light theme
WebSocket integration
```

⸻

👨‍💻 Author

Developed by

```bash
Dimas Denny WIbowo
```

Github

```bash
https://github.com/Dimas-Denny
```
