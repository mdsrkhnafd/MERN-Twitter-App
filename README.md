# 🐦 X Clone (Twitter Clone)

A full-stack social media application inspired by **X (formerly Twitter)** built with the **MERN Stack**.

## 🚀 Features

### 🔐 Authentication

- Register
- Login
- Logout
- JWT Authentication
- Protected Routes

### 👤 User Profile

- View Profile
- Edit Profile
- Update Profile Image
- Update Cover Image
- Change Password
- Follow / Unfollow Users
- Followers & Following Count

### 📝 Posts

- Create Post
- Delete Post
- Like / Unlike Post
- Comment on Post
- View User Posts
- View Liked Posts

### 🖼 Media Upload

- Cloudinary Image Upload
- Profile Image
- Cover Image
- Post Images

### 🌐 Feed

- Home Feed
- Following Feed
- User Profile Feed
- Liked Posts Feed

### 🔍 Discover

- Suggested Users
- Follow Suggestions

### ⚡ Modern UI

- React
- Tailwind CSS
- DaisyUI
- React Icons
- Responsive Design

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router DOM
- TanStack React Query
- Tailwind CSS
- DaisyUI
- React Hot Toast
- React Icons

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Cloudinary
- Cookie Parser

---

# 📂 Project Structure

```
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── db/
│   ├── lib/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/mdsrkhnafd/MERN-Twitter-App.git
```

```
cd MERN-Twitter-App
```

---

## Backend

```
cd backend
npm install
```

Create a `.env` file.

```
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
NODE_ENV=development

EMAIL_PASS=your_email_password
EMAIL_USER=your_email_address

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run Backend

```
npm run dev
```

---

## Frontend

```
cd frontend
npm install
```

Run Frontend

```
npm run dev
```

---

# 📸 Screens

- Authentication
- Home Feed
- User Profile
- Edit Profile
- Create Post
- Comments
- Likes
- Notifications

---

# 🔑 API Features

## Auth

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

## Users

- GET /api/users/profile/:username
- PATCH /api/users/update
- POST /api/users/follow/:id
- GET /api/users/suggested

## Posts

- GET /api/posts/all
- POST /api/posts/create
- DELETE /api/posts/:id
- POST /api/posts/like/:id
- POST /api/posts/comment/:id
- GET /api/posts/user/:username
- GET /api/posts/likes/:id
- GET /api/posts/following

---

# 🚀 Deployment

Frontend

- Vercel
- Netlify

Backend

- Render
- Railway
- VPS

Database

- MongoDB Atlas

Media Storage

- Cloudinary

---

# 📦 Dependencies

### Frontend

- react
- react-router-dom
- @tanstack/react-query
- react-hot-toast
- react-icons
- tailwindcss
- daisyui

### Backend

- express
- mongoose
- bcryptjs
- jsonwebtoken
- cookie-parser
- dotenv
- cloudinary
- multer

---

# 💻 Development

Frontend

```
npm run dev
```

Backend

```
npm run dev
```

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Mudasir Khan**

Flutter & MERN Stack Developer

---

⭐ If you like this project, don't forget to give it a star!
