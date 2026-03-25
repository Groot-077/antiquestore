# 🏺 AntiqueHub — Timeless Treasures Marketplace

AntiqueHub is a full-stack web application built using **Flask (Python)** and **SQLite**, designed to provide a seamless platform for buying, selling, and managing antique items.

It supports **buyers, sellers, and admins**, with features like product listings, cart system, wishlist, order management, and admin verification.

---


## 🌐 Live Demo

🚀 Website URL:
👉 https://antiquestore.lovable.app/

Replace this with your deployed link (e.g., Render / Railway / AWS / Vercel)

---

## 🚀 Quick Start

### 🔧 Requirements

* Python 3.8+
* Flask

### 📦 Installation

```bash
pip install flask
```

### ▶️ Run the Application

```bash
python run.py
```

Then open your browser:

```
http://localhost:5000
```

> The app automatically initializes the database and loads sample data on first run 

---

## 🔑 Demo Accounts

| Role   | Email                                                 | Password  |
| ------ | ----------------------------------------------------- | --------- |
| Admin  | [admin@antiquehub.com](mailto:admin@antiquehub.com)   | admin123  |
| Seller | [seller@antiquehub.com](mailto:seller@antiquehub.com) | seller123 |
| Buyer  | Register manually                                     | —         |

---

## ✨ Key Features

### 👤 Buyer

* Browse antiques with filters (price, category, origin, age)
* View detailed product pages with seller info
* Add to cart & manage quantity
* Wishlist system
* Checkout & place orders
* Order history tracking
* Reviews & ratings
* Report suspicious/fake items
* Recently viewed products

---

### 🛍️ Seller

* Add, edit, and delete listings
* Upload product images
* Manage inventory (stock)
* View listing status (Pending / Verified / Rejected)
* Dashboard with sales insights

---

### 🛠️ Admin

* Dashboard with system statistics
* Approve or reject antique listings
* Manage users and roles
* Update order status
* Handle fraud reports

---

## 🧠 System Overview

* **Backend:** Flask (Python)
* **Database:** SQLite
* **Frontend:** HTML, CSS, JavaScript, Bootstrap
* **Authentication:** Session-based login system
* **File Uploads:** Secure image uploads with validation

The application uses a modular structure with routes handling marketplace, authentication, cart, orders, and admin functionalities 

---

## 📁 Project Structure

```
antiquehub/
├── app.py                  # Main backend logic & routes
├── run.py                  # Entry point to start server
├── instance/
│   └── antiquehub.db       # SQLite database
├── static/
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript
│   └── images/uploads/     # Uploaded images
└── templates/              # HTML templates
```

---

## 🗄️ Database Schema

Main tables:

* **users** – user details, roles (buyer/seller/admin)
* **antiques** – product listings
* **cart** – shopping cart items
* **wishlist** – saved products
* **orders** – purchase records
* **order_items** – order details
* **reviews** – user feedback
* **reports** – fraud reporting system
* **recently_viewed** – tracking user activity

---

## 🔐 Security Features

* Password hashing using SHA-256
* Session-based authentication
* Role-based access control (Buyer / Seller / Admin)
* Secure file upload handling
* Input validation for forms

---

## 🎨 UI & Design

* Luxury antique theme (dark + gold accents)
* Responsive design using Bootstrap
* Clean and intuitive navigation

---

## ⚙️ Configuration

* Database auto-created in:

```
instance/antiquehub.db
```

* Upload folder:

```
static/images/uploads/
```

* Max upload size:

```
16 MB
```

---

## 🐞 Known Limitations

* No payment gateway integration (demo checkout only)
* Basic password hashing (can be upgraded to bcrypt)
* Limited scalability (SQLite for local use)

---

## 🔮 Future Improvements

* Payment gateway integration (Stripe/Razorpay)
* Real-time notifications
* Advanced search (AI recommendations)
* REST API support
* Deployment on cloud (AWS / Heroku)

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the project and submit a pull request.

---

## 📄 License

This project is open-source under the **MIT License**.

---

## 👨‍💻 Author

**Jaipal Prakash**
AntiqueHub Project

---

⭐ If you like this project, consider giving it a star!

