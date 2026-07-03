# Full-Stack Developer Portfolio

A highly polished, responsive, and interactive developer portfolio for **Gompa Rani Prasanna**, featuring a modern single-page design with dual-theme (Dark/Light) capabilities. This portfolio showcases academic achievements, technical skills, positions of responsibility, and key projects with live demo and source code integrations. It also features a fully functional secure contact message ingress portal connected to a backend telemetry suite.

---

## 🎨 Design & Key Features

- **Dark & Light Modes**: Fully responsive adaptive styling built directly with Tailwind utility classes. Easily toggle the design to match your preference with an elegant header trigger.
- **Dynamic Projects Section**: Showcases active development projects with structured tech badges, details, source code repositories, and real live deployment links.
- **Interactive Smooth Navigation**: Fluid navigation headers allow instant smooth scrolling to the featured project showcase or seamless transitions to credentials and contact portals.
- **Secure Contact Message Ingress**: A secure, private communication portal that logs inquiries to a database backend and establishes mail dispatcher routes.
- **Academic & Achievements Trackers**: Interactive sections dedicated to B.Tech Computer Science progress at NIT Durgapur, competitive programming stats, and leadership achievements.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (for uniform modern icons), Motion (for fluid animations)
- **Backend (Full-Stack Mode)**: Express, TypeScript, tsx
- **Development & Build Systems**: Vite (client bundling), esbuild (compiles server-side TypeScript to standalone production-ready CJS)

---

## 📸 Adding Your Face Picture

To display your personal picture in the hero section:
1. Create a folder named `public` in the root directory of this project if it doesn't already exist.
2. Rename your portrait picture to `face.jpg`.
3. Place `face.jpg` inside the `public` directory:
   ```text
   📁 root/
   └── 📁 public/
       └── 🖼️ face.jpg
   ```
4. Vite will automatically bundle and serve this static asset at `/face.jpg` for the frontend.

---

## 🚀 Running Locally

Follow these quick steps to launch the portfolio on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Install Dependencies
Navigate to the root directory and run:
```bash
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the root directory and define the variables as detailed in `.env.example`:
```env
PORT=3000
# Add database or mailing keys if applicable
```

### 4. Run the Development Server
Start the development environment (Express + Vite hot-reloading server):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Production Build
To test the production build locally:
```bash
# Build frontend and compile backend to CJS
npm run build

# Start production server
npm run start
```

---


## 🌐 Deploying on Render (Full-Stack Web Service)

Render is excellent for hosting full-stack applications with a persistent Express backend. Follow these steps to deploy this application as a Render Web Service:

### 1. Push to GitHub
Initialize Git, commit your files, and push the project to a public or private repository on GitHub:
```bash
git init
git add .
git commit -m "feat: portfolio full-stack setup"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create a New Web Service on Render
1. Log in to your [Render Dashboard](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your portfolio repository.

### 3. Configure the Web Service Settings
During the setup wizard, configure the following values:
- **Name**: `prasanna-portfolio` (or your preferred name)
- **Region**: Choose the region closest to your target audience (e.g., `Singapore` or `Oregon`)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start` (this runs `node dist/server.cjs` which starts the compiled server)
- **Instance Type**: Select the **Free** tier (or paid if preferred).

### 4. Configure Environment Variables
Go to the **Environment** tab on your Render Web Service page and define the following variables:
- `NODE_ENV`: `production`
- `MONGODB_URI`: `<Your MongoDB Connection String>` (highly recommended to take the contacts storage online!)
- `GEMINI_API_KEY`: `<Your Gemini API Key>` (if using smart helper queries)
- `SMTP_USER`: `<Your Sender Email Address>` (if using the contact form email dispatcher)
- `SMTP_PASS`: `<Your Email App Password>`
- *Note: You do **not** need to manually define the `PORT` variable. Render automatically sets the `PORT` environment variable, and the Express server will dynamically bind to it.*

### 5. Deploy & Verify
Click **Deploy Web Service**. Render will install dependencies, build the static Vite client, bundle the TypeScript Express server, and start the service. Once deployed, you will see:
```text
Full-Stack Server booting successfully on port 10000
MongoDB storage connection state: ONLINE
```
Your live portfolio will now be accessible at your Render sub-domain (e.g., `https://prasanna-portfolio.onrender.com`)!

