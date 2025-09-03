# 📖 AskMongo – Natural Language to MongoDB Query Assistant

AskMongo is a full-stack application that lets you query **MongoDB using natural language**. Instead of writing complex MongoDB queries, simply type what you need in plain English, and AskMongo will parse it into a valid MongoDB query object, execute it securely, and display the results in a clean UI.  

---

## ✨ Features

- 🔍 **Natural Language to Query** – Type queries like *“Show me all doctors with more than 10 years of experience”* and get results instantly.  
- 🗄️ **Database & Collection Browser** – Connect to your own MongoDB instance and navigate through databases, collections, and documents.  
- 📊 **Result Viewer** – Nicely formatted tables that handle nested fields and arrays.  
- 🛡️ **Secure Execution** – Validates AI-generated queries, blocks unsafe operators, and enforces limits.  
- 🤖 **AI Assistance** – Powered by **Gemini 2.5 Flash** LLM for query parsing and explanations.  

---

## 🏗️ Architecture

- **Frontend (View):** React.js + Tailwind CSS  
- **Backend (Controller):** Node.js + Express REST APIs  
- **Database (Model):** MongoDB  
- **AI Integration:** Google Gemini LLM
- **Design Patterns:**  
  - MVC (Model-View-Controller)  
  - Modular React components  
  - Mini Express apps for modular routing  

---

## ⚙️ Tech Stack

**Frontend:** React, Tailwind CSS, shadcn/ui  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**AI Services:** Gemini 2.5 Flash (Google Generative AI)  

---

## 🔧 Setup & Installation

### 1. Clone the Repository

  `git clone https://github.com/lohitha2511/AskMongo.git`
   
  `cd AskMongo`

### 2. Backend Setup
`cd backend`

`npm install`

`node index.js`

### 3. Frontend Setup

`cd frontend`

`npm install`

`npm run dev`


### 4. Environment Variables
**Backend (.env):**

`PORT=4990`

`GOOGLE_API_KEY=your_api_key_here`

---

## 🚀 Usage

1. Open the frontend app in your browser.  
2. Connect to your MongoDB cluster.  
3. Select a **database & collection**.  
4. Type a natural language query
5. View results in the interactive table.  

---

## Screenshots

<img width="1912" height="888" alt="Image" src="https://github.com/user-attachments/assets/7f7c8d58-2e85-4b4f-a7d0-c89cd8178d5a" />
<img width="1916" height="892" alt="Image" src="https://github.com/user-attachments/assets/65b2afd6-4f49-45d3-953e-441ee349de06" />
<img width="1890" height="862" alt="Image" src="https://github.com/user-attachments/assets/deca5594-e3ae-44fe-9f0e-d4fc30351eb2" />

---

## 🔒 Security

- Validates all AI-generated queries before execution.  
- Blocks unsafe operators (inserts, deletes, etc.).  
- Enforces result limits for performance.
