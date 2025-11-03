// learnmyway-backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require("socket.io");
const { ExpressPeerServer } = require('peer');
const { PythonShell } = require('python-shell');
const fetch = require('node-fetch');
const axios = require('axios');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const mammoth = require('mammoth');
const googlePlacesProxy = require('./google-places-proxy');
const { VertexAI } = require('@google-cloud/vertexai');
const { exec } = require('child_process');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const { createCanvas } = require('canvas');

const app = express();

// -------------------- Security Headers --------------------
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:5000 http://localhost:5001 http://localhost:5002; font-src 'self';"
  );
  next();
});

// -------------------- CORS Setup --------------------
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000',
      'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:3000','https://sjkh1qlf-5173.inc1.devtunnels.ms/'
    ];
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: false,
  optionsSuccessStatus: 200
}));

app.options('*', cors());
app.use(express.json());

// -------------------- Firebase Admin Initialization (Safe) --------------------
try {
  // Initialize Firebase Admin only if not already initialized
  if (!admin.apps.length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const serviceAccount = require('./firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized successfully.');
    } else {
      console.error('🔴 GOOGLE_APPLICATION_CREDENTIALS path is not set in your .env file!');
    }
  } else {
    console.log('ℹ️ Firebase Admin already initialized — skipping duplicate init.');
  }
} catch (error) {
  console.error('🔴 Firebase Admin SDK initialization failed:', error);
}


// Authentication Middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!mongoUser) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    req.mongoUser = mongoUser;

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Configure Multer for profile image storage
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_images/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.firebaseUid}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadProfile = multer({ storage: profileStorage });

// Configure Multer for study material storage
const materialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/materials/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.subject}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadMaterial = multer({ storage: materialStorage });


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: String,
  class: String,
  email: { type: String, required: true, unique: true },
  learningStyle: { type: String, default: null },
  interests: { type: String, default: null },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  profileImage: { type: String, default: null },
  performanceLevels: { type: Object, default: {} },
  generatedThemeImages: { type: [String], default: [] }
});
const User = mongoose.model('User', userSchema);

// MongoDB Material Schema
const materialSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  subject: { type: String, required: true },
  comment: { type: String },
  uploadedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});
const Material = mongoose.model('Material', materialSchema);

// MongoDB Session Schema
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  sessionName: { type: String, required: true },
  subject: { type: String },
  topic: { type: String },
  description: { type: String },
  joinLink: { type: String, required: true },
  scheduledTime: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true },
  targetClass: { type: String, default: 'All' },
});
const Session = mongoose.model('Session', sessionSchema);

// Serve static files (uploaded images and materials)
app.use('/uploads/profile_images', express.static('uploads/profile_images'));
app.use('/uploads/materials', express.static('uploads/materials'));
app.use('/uploads/theme_images', express.static('uploads/theme_images'));

// Google Places API proxy
// app.use('/api/google-places', googlePlacesProxy);

// Create HTTP server and attach the express app
const server = http.createServer(app);

// Initialize socket.io with the http server and force websocket transport
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket"]
});

// Socket middleware for authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    socket.user = decoded;
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (user && user.role === 'student' && user.class) {
      socket.join(`class-${user.class}`);
    }
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Initialize PeerJS Server and attach it to the same http server
const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  debug: false
});
app.use('/peerjs', peerServer);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-session', async ({ sessionId, peerId, userName, isHost }) => {
    socket.join(sessionId);
    console.log(`User ${userName} (${peerId}) joined session ${sessionId}`);
    socket.to(sessionId).emit('user-joined', { peerId, userName, isHost });
  });

  socket.on('chat-message', ({ sessionId, ...message }) => {
    io.to(sessionId).emit('chat-message', message);
  });

  socket.on('update-state', ({ sessionId, peerId, isMuted, isVideoOff }) => {
    io.to(sessionId).emit('update-state', { peerId, isMuted, isVideoOff });
  });

  socket.on('force-mute-student', ({ sessionId, peerId }) => {
    io.to(sessionId).emit('force-mute', { peerId });
  });

  socket.on('kick-student', ({ sessionId, peerId }) => {
    io.to(sessionId).emit('kicked', { peerId });
  });

  socket.on('end-session', ({ sessionId }) => {
    io.to(sessionId).emit('session-ended');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- API Endpoints ---
app.post('/api/register', async (req, res) => {
  try {
    const { firebaseUid, name, dob, class: userClass, email } = req.body;
    const newUser = new User({ firebaseUid, name, dob, class: userClass, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/user/:firebaseUid', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) return res.status(404).send('User not found.');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching user.' });
  }
});

app.put('/api/user/:firebaseUid/upload-image', authenticate, uploadProfile.single('profileImage'), async (req, res) => {
  try {
    const firebaseUid = req.params.firebaseUid;
    const profileImagePath = req.file ? `/uploads/profile_images/${req.file.filename}` : null;
    if (!profileImagePath) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: firebaseUid },
      { profileImage: profileImagePath },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send('User not found.');
    }
    res.status(200).json({ profileImage: updatedUser.profileImage });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Server error uploading image.' });
  }
});

app.put('/api/user/:firebaseUid/learning-style', authenticate, async (req, res) => {
  try {
    const { learningStyle, interests, generatedThemeImages } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.params.firebaseUid },
      { learningStyle, interests, generatedThemeImages },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/teachers/students', async (req, res) => {
  try {
    const { class: studentClass } = req.query;
    const filter = { role: 'student' };
    if (studentClass && studentClass !== 'All') {
      filter.class = studentClass;
    }
    const students = await User.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching students.' });
  }
});

app.put('/api/teachers/students/:id', async (req, res) => {
  try {
    const { name, dob, class: userClass, email, learningStyle, interests } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, dob, class: userClass, email, learningStyle, interests },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('Student not found.');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teachers/students/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { level, subjects } = req.body;

    if (!level || !subjects) {
      return res.status(400).json({ error: 'Level and subjects are required.' });
    }

    // Build update object to set performanceLevels for each subject
    const updateObj = {};
    subjects.forEach(subject => {
      updateObj[`performanceLevels.${subject}`] = level;
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true }
    );

    if (!updatedUser) return res.status(404).send('Student not found.');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating student performance:', error);
    res.status(500).json({ error: 'Server error updating student performance.' });
  }
});

app.delete('/api/teachers/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).send('Student record not found in MongoDB.');
    }

    const firebaseUid = userToDelete.firebaseUid;

    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
        console.log('Successfully deleted user from Firebase Auth:', firebaseUid);
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/user-not-found') {
          console.log('User not found in Firebase Auth, proceeding with MongoDB deletion:', firebaseUid);
        } else {
          console.error('Error deleting user from Firebase Auth:', firebaseError.message);
          return res.status(500).json({ error: 'Failed to delete from Firebase. Please check your service account permissions.' });
        }
      }
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
        console.log('Successfully deleted user from MongoDB:', id);
        res.status(200).send('Student record deleted successfully.');
    } else {
        res.status(404).send('Student record not found in MongoDB.');
    }
  } catch (error) {
    console.error('Server error during student deletion:', error);
    res.status(500).json({ error: 'Server error deleting student.' });
  }
});

app.post('/api/teachers/upload-material', uploadMaterial.single('material'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const { subject, comment, targetStudents } = req.body; 
    
    if (!subject) {
      return res.status(400).send('Subject not specified.');
    }

    const newMaterial = new Material({
      fileName: req.file.originalname,
      filePath: `/uploads/materials/${req.file.filename}`,
      subject: subject,
      comment: comment || '',
      uploadedBy: "teacher",
      timestamp: new Date(),
      targetStudents: targetStudents ? JSON.parse(targetStudents) : [],
    });

    await newMaterial.save();
    
    io.emit('session-notification', newMaterial);
    
    res.status(200).json({ message: 'Material uploaded and assigned successfully.', material: newMaterial });

  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: 'Server error uploading material.' });
  }
});

app.get('/api/materials', authenticate, async (req, res) => {
  try {
    const user = req.mongoUser;
    let filter = {};

    if (user.role === 'student') {
      filter = { targetStudents: user._id };
    } 
    
    const materials = await Material.find(filter).populate('targetStudents', 'name class');
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Server error fetching materials.' });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).send('Material not found.');
    }

    const filePath = path.join(__dirname, 'public', material.filePath);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file from disk:', err);
      }
    });

    await Material.findByIdAndDelete(id);
    res.status(200).send('Material deleted successfully.');
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Server error deleting material.' });
  }
});

app.post('/api/materials/analyze', authenticate, async (req, res) => {
  try {
    const { filePath, comment } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required.' });
    }

    const fullPath = path.join(__dirname, filePath.substring(1));

    if (!fs.existsSync(fullPath)) {
      console.error(`File not found at path: ${fullPath}`);
      return res.status(404).json({ error: 'File not found on server.' });
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    let extractedText = '';

    console.log(`Analyzing file: ${fullPath} with extension ${fileExtension}`);

    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(fullPath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if (['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
      const { data: { text } } = await Tesseract.recognize(fullPath, 'eng', {
        logger: m => console.log(`[Tesseract]: ${m.status} (${(m.progress * 100).toFixed(2)}%)`),
      });
      extractedText = text;
    } else {
      return res.status(400).json({ error: 'Unsupported file type for analysis. Only PDF and image files are supported.' });
    }

    if (!extractedText || !extractedText.trim()) {
      extractedText = "No text could be extracted from this material.";
    }

    let finalContext = extractedText;
    if (comment && comment.trim()) {
      finalContext = `The teacher provided the following instruction or task: "${comment.trim()}"\n\n---\n\nHere is the content from the material:\n${extractedText}`;
    }

    res.status(200).json({ context: finalContext });

  } catch (error) {
    console.error('Error during material analysis:', error);
    res.status(500).json({ error: 'Server error during file analysis.' });
  }
});

app.post('/api/teachers/create-session', async (req, res) => {
  try {
    const { sessionName, subject, topic, description, targetClass } = req.body;
    const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    const joinLink = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/join/${sessionId}`;

    const newSession = new Session({
      sessionId,
      sessionName,
      subject,
      topic,
      description,
      joinLink,
      uploadedBy: "teacher",
      targetClass,
      scheduledTime: new Date()
    });

    await newSession.save();
    if (newSession.targetClass === 'All') {
      io.emit('session-notification', newSession);
    } else {
      io.to(`class-${newSession.targetClass}`).emit('session-notification', newSession);
    }
    res.status(201).json({ message: 'Session created and notifications sent.', session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Server error creating session.' });
  }
});

const THEME_PROMPTS = {
  cricket: "An ultra-detailed 3D render of an intense cricket moment — a batsman hitting the ball mid-swing, stumps flying, and the red leather ball glowing in motion. High contrast, vivid colors, cinematic lighting, hyper-realistic, crystal clear details.",

  space: "A breathtaking ultra-high resolution 3D render of outer space with glowing planets, radiant nebulae, asteroid belts, and a futuristic spaceship. High contrast, neon cosmic colors, cinematic depth, ray-traced reflections, Unreal Engine style.",

  nature: "A vibrant 3D render of an enchanted glowing forest with colorful flowers, luminous plants, flowing waterfalls, and friendly animals. High contrast, magical atmosphere, ultra-detailed textures, dreamlike yet realistic, cinematic lighting.",

  science: "A futuristic 3D render of a glowing science lab filled with advanced robots, holographic screens, neon circuits, and colorful experiments. High contrast, vivid colors, sharp reflections, cinematic and hyper-detailed sci-fi design.",

  art: "A surreal and colorful 3D render of a creative art studio with floating glowing paint strokes, vibrant sculptures, and radiant masterpieces suspended in the air. High contrast, dreamlike surrealism, ultra-polished textures, visually stunning.",

  history: "A dramatic 3D render combining vivid historical moments — a knight in shining armor, ancient pyramids, dinosaurs, and old temples — blended in a cinematic fantasy scene. High contrast, vibrant colors, hyper-detailed, rich textures.",

  global: "A striking 3D render of a glowing Earth with colorful network lines wrapping around it, surrounded by holograms of diverse cultures and landmarks. High contrast, radiant neon colors, futuristic high-tech look, cinematic quality.",

  lifeSkills: "A heartwarming 3D render showing people practicing life skills — cooking with glowing ingredients, teamwork with vibrant energy effects, meditation with radiant calm light. High contrast, colorful, ultra-detailed, uplifting atmosphere.",
};

app.post('/api/generate-theme-images', async (req, res) => {
  const { theme } = req.body;
  if (!theme || !THEME_PROMPTS[theme]) {
    return res.status(400).json({ error: 'Invalid theme provided.' });
  }

  const prompt = THEME_PROMPTS[theme];
  const publicImageUrls = [];
  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const PYTHON_API_URL = 'http://localhost:5002/generate';
  const numberOfImages = 5;

  try {
    for (let i = 0; i < numberOfImages; i++) {
      const response = await fetch(PYTHON_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`Python API failed with status ${response.status}`);
      }

      const result = await response.json();
      publicImageUrls.push(`${BACKEND_URL}${result.path}`);
    }

    res.status(200).json({ backgrounds: publicImageUrls });
  } catch (error) {
    console.error('Error calling Python generation API:', error);
    res.status(500).json({ error: 'Failed to generate images.' });
  }
});

app.post('/api/generate-topic-image', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    // Generate prompt using Gemini
    const promptResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ role: 'user', parts: [{ text: `Generate a detailed, visual prompt for Stable Diffusion to create an educational image about: "${topic}". Make it suitable for students, clear, illustrative, and educational. Respond with only the prompt, no other text.` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const generatedPrompt = promptResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || topic;

    // Call Python API
    const pythonResponse = await fetch('http://localhost:5002/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: generatedPrompt }),
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python API failed with status ${pythonResponse.status}`);
    }

    const result = await pythonResponse.json();
    const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    res.status(200).json({ imageUrl: `${BACKEND_URL}${result.path}` });
  } catch (error) {
    console.error('Error generating topic image:', error);
    res.status(500).json({ error: 'Failed to generate image.' });
  }
});



//AI STUDY PLAN GENERATION ENDPOINT

let generativeModel;
try {
  const vertex_ai = new VertexAI({
    project: process.env.GCP_PROJECT_ID || 'fir-ai-app-7a45e',
    location: 'us-central1',
  });
  generativeModel = vertex_ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('✅ Vertex AI initialized successfully with gemini-2.5-flash.');
} catch (e) {
  console.error('🔴 Vertex AI initialization failed:', e);
}

const plannerStorage = multer.memoryStorage();
const plannerUpload = multer({ storage: plannerStorage });

app.post(
  '/api/generate-full-plan',
  plannerUpload.fields([
    { name: 'studyMaterial', maxCount: 1 },
    { name: 'questionPaper', maxCount: 1 },
  ]),
  async (req, res) => {
    if (!generativeModel)
      return res.status(500).json({ error: 'AI Service not configured on server.' });

    try {
      const { days, learningStyle, subject } = req.body;
      const studyMaterialFile = req.files?.['studyMaterial']?.[0] || null;
      const questionPaperFile = req.files?.['questionPaper']?.[0] || null;

      if (!studyMaterialFile || !days)
        return res
          .status(400)
          .json({ error: 'Missing required fields or study material file.' });

      let syllabus = '';

      // -------------------------------
      // 🧩 STUDY MATERIAL EXTRACTION (unchanged from previous fix)
      // -------------------------------
      try {
        const fileType = studyMaterialFile.mimetype;
        const maxPages = 50; // Increased from 10; adjust if needed

        if (fileType === 'application/pdf') {
          const pdfData = await pdfjsLib.getDocument({ data: new Uint8Array(studyMaterialFile.buffer) }).promise;


          let text = '';
          for (let i = 1; i <= Math.min(maxPages, pdfData.numPages); i++) {
            const page = await pdfData.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ') + '\n';
          }
          // Clean text: Trim, remove extra whitespace
          syllabus = text.replace(/\s+/g, ' ').trim();
          console.log('📘 Extracted study text length:', syllabus.length);
        } else if (['image/png', 'image/jpeg'].includes(fileType)) {
          const { data: { text } } = await Tesseract.recognize(
            studyMaterialFile.buffer,
            'eng'
          );
          syllabus = text.trim();
        } else if (fileType === 'text/plain') {
          syllabus = studyMaterialFile.buffer.toString('utf8').trim();
        } else {
          return res.status(400).json({ error: 'Unsupported study file type.' });
        }

        // Fallback OCR if short text (increased pages)
        if (syllabus.trim().length < 500) { // Raised threshold
          console.log('⚠️ Study text short—running OCR fallback...');
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(studyMaterialFile.buffer),
          });
          const pdf = await loadingTask.promise;
          let ocrText = '';

          for (let i = 1; i <= Math.min(maxPages, pdf.numPages); i++) {
            const page = await pdf.getPage(i);
            const scale = 2.0;
            const viewport = page.getViewport({ scale });
            const canvas = createCanvas(viewport.width, viewport.height);
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            const pngBuffer = canvas.toBuffer('image/png');
            const { data: { text } } = await Tesseract.recognize(pngBuffer, 'eng');
            ocrText += '\n' + text.trim();
          }

          syllabus += ocrText.trim();
          syllabus = syllabus.replace(/\s+/g, ' ').trim(); // Clean again
          console.log('✅ OCR fallback added, length:', syllabus.length);
        }
      } catch (err) {
        console.error('🔴 Study material extraction failed:', err);
        return res.status(500).json({ error: 'Failed to extract study material.' });
      }

      if (!syllabus.trim())
        return res.status(500).json({ error: 'No text extracted from study material.' });

      // -------------------------------
      // 🧠 PLAN GENERATION PROMPT (unchanged)
      // -------------------------------
      const planPrompt = `
You are an expert educational planner and motivational coach.
Create a highly specific, personalized, and motivational ${days}-day study timetable 
based ONLY on the provided study material.

**Instructions:**
- Extract real topics and chapters from the text.
- Create detailed time slots (Morning, Noon, Evening).
- Add “Today's Goal” and “Daily Motivation” for each day.
- Include lunch and short breaks.
- Avoid generic sentences.
- Adapt for ${learningStyle} learner.

**Subject:** ${subject}

**Study Material:**
${syllabus}
      `;

      const planResponse = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: planPrompt }] }],
      });

      const plan =
        planResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
        planResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No plan generated.';

      // -------------------------------
      // 📘 QUESTION PAPER HANDLING (UPDATED: Better prompt to include questions)
      // -------------------------------
      let answers = 'No question paper uploaded.';
      if (questionPaperFile) {
        let questionPaperText = '';

        try {
          const fileType = questionPaperFile.mimetype;
          const maxQPages = 20; // Increased from 5 for longer papers

          if (fileType === 'application/pdf') {
            const pdfData = await pdfjsLib.getDocument({
              data: new Uint8Array(questionPaperFile.buffer),
            }).promise;
            let combinedText = '';
            for (let i = 1; i <= Math.min(maxQPages, pdfData.numPages); i++) {
              const page = await pdfData.getPage(i);
              const textContent = await page.getTextContent();
              combinedText += textContent.items.map((item) => item.str).join(' ') + '\n';
            }
            questionPaperText = combinedText.replace(/\s+/g, ' ').trim();
          } else if (['image/png', 'image/jpeg'].includes(fileType)) {
            const { data: { text } } = await Tesseract.recognize(
              questionPaperFile.buffer,
              'eng'
            );
            questionPaperText = text.trim();
          } else if (fileType === 'text/plain') {
            questionPaperText = questionPaperFile.buffer.toString('utf8').trim();
          }

          // Fallback OCR (increased pages)
          if (questionPaperText.trim().length < 200) {
            console.log('⚠️ Running OCR fallback for question paper...');
            const loadingTask = pdfjsLib.getDocument({
              data: new Uint8Array(questionPaperFile.buffer),
            });
            const pdf = await loadingTask.promise;
            let ocrText = '';
            for (let i = 1; i <= Math.min(maxQPages, pdf.numPages); i++) {
              const page = await pdf.getPage(i);
              const scale = 2.0;
              const viewport = page.getViewport({ scale });
              const canvas = createCanvas(viewport.width, viewport.height);
              const ctx = canvas.getContext('2d');
              await page.render({ canvasContext: ctx, viewport }).promise;
              const pngBuffer = canvas.toBuffer('image/png');
              const { data: { text } } = await Tesseract.recognize(pngBuffer, 'eng');
              ocrText += '\n' + text.trim();
            }
            questionPaperText += ocrText.trim();
            questionPaperText = questionPaperText.replace(/\s+/g, ' ').trim();
          }

          // -------------------------------
          // ✨ ANSWER GENERATION PROMPT (UPDATED: Instruct to include full question text)
          // -------------------------------
          if (questionPaperText.trim()) {
            const answerPrompt = `
You are an expert tutor in Deep Learning.

First, carefully extract the 10 numbered questions from the raw questions text below (ignore duplicates or noise from extraction).

Then, for EACH question (1 to 10), output in this EXACT format:

N. **Question:** [Full exact question text]

   **Answer:** [Concise explanation, 2-4 sentences max. Use ONLY relevant excerpts from the study material. Quote key phrases if possible. If no direct match, infer closely or say: "The answer could not be found in the study material."]

- Use bullet points for lists/steps if relevant.
- Keep answers focused and accurate.

**Raw Questions Text (parse carefully):**
${questionPaperText}

**Study Material (full extracted content):**
${syllabus}
            `;

            const answerResponse = await generativeModel.generateContent({
              contents: [{ role: 'user', parts: [{ text: answerPrompt }] }],
            });

            answers =
              answerResponse.candidates?.[0]?.content?.parts?.[0]?.text ||
              answerResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
              'No answers generated.';
          } else {
            answers = 'No readable text found in question paper.';
          }
        } catch (e) {
          console.error('🔴 Question paper extraction error:', e);
          answers = 'Failed to process question paper.';
        }
      }

      // ✅ Final Response
      res.status(200).json({ plan, answers });
    } catch (error) {
      console.error('🔴 Error in /api/generate-full-plan:', error);
      res.status(500).json({ error: 'Failed to generate study plan.' });
    }
  }
);


app.post('/api/youtube-videos', async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    // Mock YouTube videos data since we don't have YouTube API key
    // In production, you would use YouTube Data API v3
    // In server.js
const mockVideos = [
  {
    title: `${subject} - Introduction and Basics`,
    video_id: 'YOUTUBE_ID_1', // Unique ID
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    title: `Advanced ${subject} Concepts`,
    video_id: 'YOUTUBE_ID_2', // Unique ID
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    title: `${subject} Practice Problems`,
    video_id: 'YOUTUBE_ID_3', // Unique ID
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];

    res.status(200).json({ videos: mockVideos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube videos' });
  }
});

app.post('/api/adapt-plan', async (req, res) => {
  try {
    const { score, previousPlan } = req.body;

    if (!score || !previousPlan) {
      return res.status(400).json({ error: 'Score and previous plan are required' });
    }

    const scorePercentage = parseInt(score);
    let adaptationStrategy = '';

    if (scorePercentage >= 80) {
      adaptationStrategy = 'advanced topics and challenging exercises';
    } else if (scorePercentage >= 60) {
      adaptationStrategy = 'moderate pace with additional practice';
    } else {
      adaptationStrategy = 'basic concepts with more repetition and simpler examples';
    }

    const prompt = `Adapt the following study plan based on a quiz score of ${scorePercentage}%. The student scored ${scorePercentage}%, so focus on ${adaptationStrategy}.

Original Plan:
${previousPlan}

Please provide an adapted study plan that adjusts the difficulty and pace according to the student's performance.`;

    // Add timeout to Gemini API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY, // Added this line for explicit key
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
      throw new Error(`Gemini API failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    const adaptedPlan = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Unable to adapt study plan';

    res.status(200).json({ adaptedPlan });
  } catch (error) {
    console.error('Error adapting study plan:', error);
    if (error.name === 'AbortError') {
      res.status(500).json({ error: 'Request timed out. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to adapt study plan' });
    }
  }
});

// --- NEW CHAT ENDPOINT (FIXED) ---
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message, systemInstruction } = req.body;

    if (!history || !message || !systemInstruction) {
      return res.status(400).json({ error: 'Missing required fields: history, message, or systemInstruction' });
    }

    // 1. Check if your successfully initialized Vertex AI model exists
    if (!generativeModel) {
      return res.status(500).json({ error: 'AI Service (Vertex AI) not configured on server.' });
    }

    // 2. Format the chat history for the Vertex AI SDK
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }],
      },
      {
        role: 'model',
        parts: [{ text: "Okay, I understand. I will act as instructed." }],
      },
      ...history,
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    // 3. Use the Vertex AI SDK (generativeModel) instead of axios
    const sdkResponse = await generativeModel.generateContent({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      },
    });

    // 4. Send the SDK's response. 
    // The 'candidates' array is inside the 'response' property.
    res.status(200).json(sdkResponse.response);

  } catch (error) {
    console.error('Error in /api/chat endpoint:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to get response from AI model.' });
  }
});

const PORT = process.env.PORT || 5001;// Ensure your server is created if not already
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));