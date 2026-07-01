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

## ☁️ Deploying on Vercel

Vercel is optimized for frontend Single Page Applications (SPAs). You can deploy this portfolio in either static frontend mode or serverless mode.

### Option A: Deploy as a Static Client-Side SPA (Recommended for Vercel)
Since Vercel excels at hosting static files, you can deploy the portfolio's React interface directly:

1. **Push to GitHub**: Initialize a Git repository and push your project to GitHub.
2. **Import to Vercel**: Log in to the [Vercel Dashboard](https://vercel.com) and click **Add New > Project**, then import your GitHub repository.
3. **Configure Settings**:
   - **Framework Preset**: Choose `Vite`.
   - **Build Command**: `npm run build` (or `vite build` if you only want the client files built).
   - **Output Directory**: `dist`.
4. **Deploy**: Click **Deploy**. Vercel will build the frontend assets and serve them globally via their CDN.

### Option B: Deploying Full-Stack Capabilities (Vercel Serverless Functions)
If you require server-side routes (Express endpoints) to run on Vercel:
1. Add a `vercel.json` configuration file to your root directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.ts",
         "use": "@vercel/node"
       },
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": { "distDir": "dist" }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```
2. Connect and deploy the repository via Vercel. Vercel will automatically provision serverless handlers for your `/api` routes!
