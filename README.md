# 🛒 E-Commerce Website — Full-Stack Project

> A modern and responsive full-stack e-commerce website built using **Node.js, Express, MySQL, JWT, HTML, CSS, and JavaScript**.  
> Provides product browsing, cart & order management, user authentication, and an admin panel.

---

## 🌐 Live Preview

> Add your deployed link if hosted, e.g.:
https://your-frontend-url.com

---

## 📌 Features

✨ Modern UI and fully responsive design  
✨ User authentication with JWT (signup/login/logout)  
✨ Product listing, product preview, and search  
✨ Add to cart, remove from cart, and checkout  
✨ Orders page with real-time tracking  
✨ Admin panel: add/edit/delete products, view stats  
✨ Daily login bonus, spin & win, notifications  
✨ Smooth scrolling, hover animations, and hero banners  

---

## 🛠️ Tech Stack

| Technology        | Purpose                                    |
| ----------------- | ----------------------------------------- |
| **Node.js**       | Backend runtime                            |
| **Express.js**    | Backend API framework                      |
| **MySQL**         | Relational database for users, products, orders |
| **JWT**           | Authentication & authorization            |
| **HTML5/CSS3**    | Frontend structure & styling              |
| **JavaScript**    | Frontend interactivity & dynamic behavior |
| **Responsive Design** | Mobile and tablet friendly UI          |

---

## 📂 Project Structure

```text
E-commerce/
│── LICENSE
│── README.md
│── CONTRIBUTING.md
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── hiero-bot.yml
│
├── assets/
│   ├── images/
│   ├── videos/
│   └── icons/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── schema.sql
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── admin.html
│   ├── blog.html
│   ├── cart.html
│   ├── checkout.html
│   ├── contact.html
│   ├── dashboard.html
│   ├── help.html
│   ├── order.html
│   ├── privacy.html
│   ├── product.html
│   ├── profile.html
│   ├── shop.html
│   ├── signin.html
│   ├── signup.html
│   │
│   ├── components/
│   │   ├── navbar.html
│   │   └── footer.html
│   │
│   ├── scripts/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── checkout.js
│   │   ├── dashboard.js
│   │   ├── order.js
│   │   ├── product.js
│   │   ├── profile.js
│   │   ├── shop.js
│   │   └── script.js
│   │
│   └── styles/
│       ├── admin.css
│       ├── auth.css
│       ├── cart.css
│       ├── checkout.css
│       ├── dashboard.css
│       ├── order.css
│       ├── product.css
│       ├── profile.css
│       ├── shop.css
│       └── style.css
│
└── package.json
```

---

## 🚀 How to Run Locally

### 1️⃣ Clone the Repository
```
git clone https://github.com/your-username/E-commerce.git
```

### 2️⃣ Navigate to the Project Folder

```
cd ecommerce-project
```

## ⚙️ Backend Setup
### 3️⃣ Navigate to Backend Folder
```
cd backend
```

4️⃣ Install Dependencies
```
npm install
```

5️⃣ Create Environment File
Create a .env file inside the backend/ folder using .env.example:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ecommerce
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://127.0.0.1:5500
```

6️⃣ Import Database Schema
```
mysql -u root -p ecommerce < schema.sql
```

7️⃣ Start Backend Server
```
npm run dev
```

Backend will run at:
```
http://localhost:5000
```

## 🌐 Frontend Setup
### 8️⃣ Open Frontend Folder
Open the frontend/ folder in VS Code.

### 9️⃣ Run Frontend
Use Live Server extension or any local server.
Example using VS Code Live Server:
- Right click on index.html
- Click Open with Live Server

Frontend will run at:
```
http://127.0.0.1:5500
```

---

## 🎯 Learning Goals

This project demonstrates:

* Full-stack web development fundamentals
* REST API development using Node.js & Express
* MySQL database integration and query handling
* JWT-based authentication & authorization
* Frontend UI/UX design and responsive layouts
* DOM manipulation and dynamic rendering
* Cart, checkout, and order management systems
* Admin dashboard development
* Real-world e-commerce application architecture
* API integration between frontend and backend
* Open-source project structuring and collaboration
* Debugging, validation, and error handling

---

## 👨‍💻 Maintainers & Organization

This project is developed under the **[Anthropic Bots](https://github.com/AnthropicBots)** organization.

### 👑 Organization Owner
**[Mohit Yadav](https://github.com/mohityadav8)**

- Founder & Owner of Anthropic Bots
- Passionate about Full-Stack Development & Software Engineering
- Focused on building scalable real-world applications

---

### 🛠️ Project Maintainer
**[Bhuvansh Kataria](https://github.com/BHUVANSH855)**

- Active maintainer of this E-Commerce project
- Responsible for feature development, backend integration, bug fixes, and open-source improvements
- Contributing towards improving project structure, security, and overall user experience

---
💡 This project is actively maintained and improved through open-source collaboration.

Contributions, suggestions, and improvements are always welcome.

---

## 📜 License

This project is licensed under the MIT License and is free to use for learning and educational purposes.

---

⭐ If you like this project, consider giving it a star on GitHub and supporting the repository!
