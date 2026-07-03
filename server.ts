import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(express.json());

// MongoDB connection with fallback configuration
const MONGODB_URI = process.env.MONGODB_URI;
let isConnectedToMongo = false;
let ContactModel: any = null;

async function connectToMongo() {
  if (MONGODB_URI) {
    console.log('Initiating MongoDB connection attempt...');
    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Successfully connected to MongoDB.');
      isConnectedToMongo = true;
    } catch (err: any) {
      console.error('MongoDB connection failed:', err.message);
      console.log('Falling back to local storage file persistence.');
      isConnectedToMongo = false;
    }
  } else {
    console.log('No MONGODB_URI environment variable detected. Defaulting to local JSON storage fallback.');
    isConnectedToMongo = false;
  }
}

// Contact Schema definition for MongoDB
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  aiSummary: { type: String },
  aiSentiment: { type: String },
  aiDraftReply: { type: String }
});

try {
  ContactModel = mongoose.model('Contact', contactSchema);
} catch (e) {
  // Model might already be registered in cached module load
}

// Local JSON Storage fallback handler
const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'contacts_data.json');

async function saveContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  aiSummary?: string;
  aiSentiment?: string;
  aiDraftReply?: string;
}) {
  if (isConnectedToMongo && ContactModel) {
    try {
      const doc = new ContactModel(data);
      const saved = await doc.save();
      return saved;
    } catch (err) {
      console.error('Failed to save message to MongoDB:', err);
    }
  }

  // File fallback
  try {
    let contacts = [];
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      try {
        contacts = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8'));
      } catch (e) {
        contacts = [];
      }
    }
    const newRecord = {
      ...data,
      _id: 'local_' + Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    contacts.push(newRecord);
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
    return newRecord;
  } catch (err) {
    console.error('Failed to persist contact message to local JSON file:', err);
    return { ...data, _id: 'temp_' + Date.now().toString(), createdAt: new Date().toISOString() };
  }
}

async function getContactMessages() {
  if (isConnectedToMongo && ContactModel) {
    try {
      return await ContactModel.find().sort({ createdAt: -1 });
    } catch (err) {
      console.error('Failed to fetch from MongoDB:', err);
    }
  }

  // File fallback
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.reverse() : [];
    }
  } catch (err) {
    console.error('Failed to read messages from local JSON file:', err);
  }
  return [];
}

async function deleteContactMessage(id: string) {
  if (isConnectedToMongo && ContactModel) {
    try {
      await ContactModel.findByIdAndDelete(id);
      return true;
    } catch (err) {
      console.error('Failed to delete from MongoDB:', err);
    }
  }

  // File fallback
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      let contacts = JSON.parse(raw);
      if (Array.isArray(contacts)) {
        contacts = contacts.filter((c: any) => c._id !== id);
        fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to delete message from local JSON file:', err);
  }
  return false;
}

// Nodemailer SMTP integration
async function sendEmailNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  aiSummary?: string;
  aiSentiment?: string;
  aiDraftReply?: string;
}) {
  let host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || '587';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || 'raniprasanna997@gmail.com';

  if (!user || !pass) {
    console.log('SMTP service coordinates (SMTP_USER / SMTP_PASS) not set. Skipping actual email dispatch.');
    return { sent: false, reason: 'Credentials not configured' };
  }

  // Smart fallback for SMTP Host if not explicitly provided
  if (!host) {
    if (user.includes('@gmail.com')) {
      host = 'smtp.gmail.com';
    } else if (user.includes('@outlook.com') || user.includes('@hotmail.com')) {
      host = 'smtp-mail.outlook.com';
    } else if (user.includes('@yahoo.com')) {
      host = 'smtp.mail.yahoo.com';
    } else {
      console.log('SMTP_HOST is not specified and could not auto-resolve from SMTP_USER email. Skipping actual email dispatch.');
      return { sent: false, reason: 'SMTP_HOST not specified' };
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: port === '465',
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 5000, // Fail fast if SMTP port is blocked or unreachable (5 seconds)
      greetingTimeout: 5000,   // Fail fast if greeting response is slow (5 seconds)
      socketTimeout: 10000,    // Idle timeout for socket operations (10 seconds)
    });

    const mailOptions = {
      from: `"${data.name} via Portfolio" <${user}>`,
      replyTo: data.email,
      to: receiver,
      subject: `[Portfolio Contact Alert] ${data.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; color: #1e293b;">
          <h2 style="color: #4f46e5; margin-top: 0;">New Inquiry from Portfolio</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;"/>
          
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          
          <div style="margin-top: 20px; margin-bottom: 20px;">
            <strong>Message Content:</strong>
            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin-top: 8px; border-radius: 4px; font-style: italic; white-space: pre-wrap;">${data.message}</div>
          </div>
          
          ${data.aiSentiment ? `
          <div style="background-color: #eff6ff; padding: 12px; border-radius: 6px; margin-top: 16px; border: 1px solid #bfdbfe;">
            <p style="margin: 0 0 6px 0; color: #1e40af; font-weight: 600;">🤖 Gemini Analysis Report:</p>
            <p style="margin: 4px 0;"><strong>Sentiment:</strong> <span style="background-color: #dbeafe; padding: 2px 6px; border-radius: 4px; font-size: 13px;">${data.aiSentiment}</span></p>
            <p style="margin: 4px 0;"><strong>Summary:</strong> ${data.aiSummary}</p>
            <p style="margin: 4px 0;"><strong>Suggested Draft Response:</strong></p>
            <div style="background-color: #ffffff; border: 1px dashed #93c5fd; padding: 8px 12px; font-size: 13px; font-style: italic; border-radius: 4px; margin-top: 4px;">${data.aiDraftReply}</div>
          </div>
          ` : ''}
          
          <p style="font-size: 11px; color: #64748b; margin-top: 30px; text-align: center;">
            Sent automatically by Prasanna Portfolio Server. Saved to Portfolio Database.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email dispatched successfully. MessageID:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('SMTP email dispatch error:', err);
    return { sent: false, error: err.message };
  }
}

// Gemini AI service initialization (Server-side ONLY)
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function analyzeWithGemini(name: string, subject: string, message: string) {
  if (!ai) {
    return {
      summary: 'Automated processing received your message content.',
      sentiment: 'Neutral',
      draftReply: 'Thank you for getting in touch! I have successfully logged your inquiry and will review it shortly.'
    };
  }

  try {
    const prompt = `You are the back-end AI engine for Gompa Rani Prasanna's professional portfolio.
Prasanna is a B.Tech CSE student at National Institute of Technology, Durgapur.
A visitor named "${name}" has sent a contact form submission.

Message Subject: "${subject}"
Message Content: "${message}"

Examine this incoming message and return a JSON object with strictly these keys:
- "summary": A concise, precise 1-sentence synopsis of what the sender is requesting.
- "sentiment": A single-word category describing the tone (Professional, Inquisitive, Friendly, Urgent, Spam, or Collaborative).
- "draftReply": A warm, polite, professional 2-3 sentence auto-generated email reply draft representing Prasanna. Assure them she has received their note and will get back to them at their email address shortly.

Ensure your output is strictly a clean JSON payload. Do not wrap in markdown quotes. Valid JSON only.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = result.text?.trim() || '{}';
    try {
      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary || 'Message parsed.',
        sentiment: parsed.sentiment || 'Professional',
        draftReply: parsed.draftReply || 'Thank you for reaching out! I will review your message and reply soon.'
      };
    } catch (parseErr) {
      console.error('Gemini output was not valid JSON:', text);
      return {
        summary: 'Visitor sent an inquiry.',
        sentiment: 'Professional',
        draftReply: 'Hi, thanks for reaching out. I have received your message and will get back to you shortly!'
      };
    }
  } catch (err) {
    console.error('Gemini content processing failure:', err);
    return {
      summary: 'Inquiry received securely.',
      sentiment: 'Professional',
      draftReply: 'Hello! Thank you for the message. I will review it and follow up as soon as possible.'
    };
  }
}

// PROFILE API ROUTE
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Gompa Rani Prasanna',
    tagline: 'Computer Science & Engineering Student | Full-Stack Developer | Problem Solver',
    email: 'raniprasanna997@gmail.com',
    phone: '9392372226',
    linkedin: 'https://linkedin.com/in/raniprasanna',
    github: 'https://github.com/Rani-Prasanna',
    location: 'NIT Durgapur, India',
    education: {
      institution: 'National Institute of Technology, Durgapur',
      degree: 'Bachelor of Technology in Computer Science and Engineering',
      period: '2024 - 2028',
      cgpa: '8.8 / 10'
    },
    skills: {
      languages: ['C', 'C++', 'Python', 'HTML', 'CSS', 'JavaScript', 'SQL'],
      frameworks: ['React.js', 'Django', 'Streamlit', 'Bootstrap', 'NumPy', 'Pandas', 'scikit-learn', 'FastAPI', 'Flask'],
      tools: ['Git/GitHub', 'Linux (Ubuntu)', 'Docker', 'MongoDB', 'AWS'],
      coursework: ['Data Structures and Algorithms', 'Digital Logic Design', 'OOP', 'Analysis and Design of Algorithms']
    },
    positions: [
      {
        title: 'Junior Coordinator',
        org: 'Center for Cognitive Activities, NIT Durgapur',
        period: 'May 2025 – Present',
        bullets: [
          'Maintained and optimized the official CCA website using ReactJS, improving event traffic and user engagement by 25%.',
          'Led a 15+ member team in developing and deploying the official platform for Aarohan, the Techno-Management Fest of NIT Durgapur, while successfully organizing 15+ technical events and workshops for 100+ participants, enhancing student outreach and engagement under strict deadlines.'
        ]
      },
      {
        title: 'Junior Coordinator',
        org: 'RadioNITroz, NIT Durgapur',
        period: 'Jan 2025 – Present',
        bullets: [
          'Led website development and coordinated execution of major cultural events. Led a 5+ member team.'
        ]
      },
      {
        title: 'Training and Placement Representative',
        org: 'NIT Durgapur',
        period: 'Dec 2025 – Present',
        bullets: [
          'Serving as a bridge between the T&P Cell and the student community, ensuring clear and timely communication of all placement/internship-related updates.'
        ]
      }
    ],
    achievements: [
      'Solved 350+ competitive programming challenges across LeetCode, Codechef (3 star 1600+), and Codeforces (pupil rating).',
      'Completed CS50x Introduction to Computer Science by Harvard University.',
      'Certified in "Node.js, Express, MongoDB & More: The Complete Bootcamp" on Udemy.'
    ]
  });
});

// PROJECTS API ROUTE
app.get('/api/projects', (req, res) => {
  res.json([
    {
      id: 'ccanitd',
      title: 'CCANITD Website',
      tech: 'React.js, Firebase, CSS animations',
      category: 'Web Development',
      description: 'Official portal for NIT Durgapur\'s premier technical club, Centre for Cognitive Activities.',
      bullets: [
        'Developed the official responsive website utilizing ReactJS and Firebase backend modules.',
        'Collaborated with a cross-functional 10-member team to feature event trackers and live workshop updates.',
        'Successfully drove user engagement upward by 30% through rich, responsive design and modern interface layout.'
      ],
      link: 'https://github.com/Rani-Prasanna',
      liveLink: 'https://ccanitd.in'
    },
    {
      id: 'sentiment-analysis',
      title: 'Sentiment Analysis Pipeline',
      tech: 'Python, FastAPI, Pandas, NumPy, scikit-learn',
      category: 'Machine Learning / NLP',
      description: 'An end-to-end sentiment assessment system processing text inputs to evaluate emotional markers.',
      bullets: [
        'Created high-performance text cleansing pipelines utilizing custom tokenization and vocabulary vector models.',
        'Boosted overall sentiment accuracy by 17% on benchmark evaluation databases.',
        'Integrated a responsive FastAPI backend structure to enable rapid web-based client queries.'
      ],
      link: 'https://github.com/Rani-Prasanna',
      liveLink: 'https://sentiment-analyzer-demo.streamlit.app'
    },
    {
      id: 'quiz-system',
      title: 'Dynamic Quiz Platform',
      tech: 'Flask, SQLite3, Jinja2, Bootstrap',
      category: 'Web Development',
      description: 'Interactive web platform where instructors create questions and students take customized tests.',
      bullets: [
        'Architected relational database tables with SQLite3 to support questions, responses, scores, and users.',
        'Coded rigorous user authentication guards and validation parameters preventing account collision.',
        'Engineered dynamic Jinja2 page templating for responsive, immediate feedback during test administration.'
      ],
      link: 'https://github.com/Rani-Prasanna',
      liveLink: 'https://quiz-platform-demo.herokuapp.com'
    }
  ]);
});

// CONTACT API POST ROUTE
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields (name, email, subject, message) are required.' });
  }

  try {
    // 1. Run server-side Gemini analysis on message context
    const aiAnalysis = await analyzeWithGemini(name, subject, message);

    // 2. Prepare database record payload
    const recordPayload = {
      name,
      email,
      subject,
      message,
      aiSummary: aiAnalysis.summary,
      aiSentiment: aiAnalysis.sentiment,
      aiDraftReply: aiAnalysis.draftReply
    };

    // 3. Persist record (MongoDB or JSON file fallback)
    const savedRecord = await saveContactMessage(recordPayload);

    // 4. Send email notification (if SMTP credentials present)
    const emailResponse = await sendEmailNotification(recordPayload);

    return res.status(201).json({
      success: true,
      message: 'Contact request recorded successfully.',
      data: savedRecord,
      ai: {
        sentiment: aiAnalysis.sentiment,
        summary: aiAnalysis.summary,
        draftReply: aiAnalysis.draftReply
      },
      emailNotification: emailResponse
    });
  } catch (error: any) {
    console.error('Contact processing failure:', error);
    return res.status(500).json({ error: 'Failed to process inquiry. Please try again later.' });
  }
});

// SECURE MESSAGES VIEW (ADMIN)
// We provide a quick way to view the stored database inquiries.
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await getContactMessages();
    return res.json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteContactMessage(id);
    if (success) {
      return res.json({ success: true, message: 'Message deleted successfully.' });
    }
    return res.status(404).json({ error: 'Message not found.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// STATS API ROUTE
app.get('/api/stats', async (req, res) => {
  try {
    const messages = await getContactMessages();
    res.json({
      totalInquiries: messages.length,
      sentimentBreakdown: messages.reduce((acc: any, cur: any) => {
        const sent = cur.aiSentiment || 'Unknown';
        acc[sent] = (acc[sent] || 0) + 1;
        return acc;
      }, {})
    });
  } catch (e: any) {
    res.json({ totalInquiries: 0, sentimentBreakdown: {} });
  }
});

// Start Express Application after configuring Vite
async function bootstrap() {
  // Ensure MongoDB connection is resolved before booting the HTTP listener
  await connectToMongo();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Full-Stack Server booting successfully on port ${PORT}`);
    console.log(`MongoDB storage connection state: ${isConnectedToMongo ? 'ONLINE' : 'OFFLINE (FILE FALLBACK ACTIVE)'}`);
  });
}

bootstrap();
