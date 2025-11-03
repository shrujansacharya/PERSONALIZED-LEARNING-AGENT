
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMapsService, Store, UserLocation } from '../maps-service';
import { getProductsService, Product, CartItem } from '../products-service';
import { getProjectImage } from '../../lib/image-service';
import { GeminiService } from '../../lib/gemini-service';
import { getGoogleProductSearchService, ProductSearchResult } from '../google-product-search-service';
import { projectTemplates } from './ProjectTemplates';
import { ProjectTemplate, ChatMessage, YouTubeVideo } from './types';
import { YouTubeService } from '../../lib/YouTubeService';

const GOOGLE_CUSTOM_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_CUSTOM_SEARCH_API_KEY || 'AIzaSyB9UsFVYRNW-KDhDc3e77DXfJuRy-x1C-M';
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const useProjectBuilder = () => {
  const [view, setView] = useState<'landing' | 'software' | 'science' | 'project-detail'>('landing');
  const [previousView, setPreviousView] = useState<'landing' | 'software' | 'science'>('landing');
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showLearningModeModal, setShowLearningModeModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [currentBackground, setCurrentBackground] = useState<number>(0);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [videoPosition, setVideoPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [videoSize, setVideoSize] = useState({ width: 400, height: 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[][]>([]);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'history' | 'files' | 'video' | 'ideas' | 'code' | 'notes' | 'planner'>('code');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // AI Features state
  const [projectIdeas, setProjectIdeas] = useState<string[]>([]);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [projectPlan, setProjectPlan] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [ideasInput, setIdeasInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [planInput, setPlanInput] = useState('');

  // Store state
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [storeSearchResults, setStoreSearchResults] = useState<any[]>([]);

  // Product search state
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  const [isProductSearching, setIsProductSearching] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState('All');
  const [productSearchHistory, setProductSearchHistory] = useState<string[]>([]);

  // Project filtering state
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Other state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; duration?: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Favourites state
  const [favourites, setFavourites] = useState<string[]>(() => {
    const saved = localStorage.getItem('projectFavourites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const youtubeService = new YouTubeService(YOUTUBE_API_KEY || '');
  const productSearchService = getGoogleProductSearchService(GOOGLE_CUSTOM_SEARCH_API_KEY, GOOGLE_CUSTOM_SEARCH_ENGINE_ID);
  const autoSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('projectFavourites', JSON.stringify(favourites));
  }, [favourites]);

  const toggleFavourite = (projectId: string) => {
    setFavourites(prev => {
      const isFavourite = prev.includes(projectId);
      const newFavourites = isFavourite
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];

      setToast({
        message: isFavourite ? 'Removed from favourites' : 'Added to favourites',
        type: 'success',
        duration: 2000
      });

      return newFavourites;
    });
  };

  const isFavourite = (projectId: string) => {
    return favourites.includes(projectId);
  };

  const requestLocationPermission = async (): Promise<UserLocation | null> => {
    setIsRequestingLocation(true);
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setToast({
          message: 'Geolocation is not supported by this browser.',
          type: 'error',
          duration: 3000
        });
        setIsRequestingLocation(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setLocationPermissionGranted(true);
          setIsRequestingLocation(false);
          resolve(userLoc);
        },
        (error) => {
          console.warn('Location permission denied or error:', error);
          setLocationPermissionGranted(false);
          setIsRequestingLocation(false);
          setToast({
            message: 'Location access denied. Using default location.',
            type: 'error',
            duration: 3000
          });
          // Return default location
          const defaultLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
          setUserLocation(defaultLocation);
          resolve(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const fetchNearbyStores = async (location: UserLocation) => {
    try {
      const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');
      const stores = await mapsService.findNearbyStores(location).catch((err) => {
        console.warn('findNearbyStores failed, using fallback stores:', err);
        return mapsService.getMockStores(location);
      });
      setNearbyStores(stores || []);
    } catch (error) {
      console.warn('Error fetching nearby stores:', error);
      setNearbyStores([]);
    }
  };

  useEffect(() => {
    const initializeServices = async () => {
      try {
        const productsService = getProductsService();
        setProducts(productsService.getAllProducts());

        if (navigator.geolocation) {
          navigator.geolocation.watchPosition((position) => {
            (async () => {
              try {
                const userLocation: UserLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };

                const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');

                const stores = await mapsService.findNearbyStores(userLocation).catch((err) => {
                  console.warn('ProjectBuilder: findNearbyStores failed, using fallback stores:', err);
                  return mapsService.getFallbackStores(userLocation);
                });

                setNearbyStores(stores || []);
              } catch (err) {
                console.warn('ProjectBuilder: Error while fetching nearby stores:', err);
                setNearbyStores([]);
              }
            })();
          }, (geoErr) => {
            console.warn('Geolocation error (watchPosition):', geoErr);
            const fallbackLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
            const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');
            mapsService.findNearbyStores(fallbackLocation).then(stores => setNearbyStores(stores)).catch(() => setNearbyStores([]));
          });
        }
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();

    const backgroundInterval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % 6);
    }, 8000);

    return () => clearInterval(backgroundInterval);
  }, []);

  const handleLearningModeSelect = async (mode: 'video' | 'chatbot') => {
    setShowLearningModeModal(false);
    
    if (mode === 'video') {
      await handleWatchVideos();
    } else if (mode === 'chatbot') {
      setShowChatbot(true);
      if (selectedProject) {
        const initialMessage: ChatMessage = {
          role: 'assistant',
          content: `Hi! I'm here to help you with your ${selectedProject.title} project. What would you like to know?`,
          timestamp: new Date()
        };
        setChatMessages([initialMessage]);
      }
    }
  };

  const handleWatchVideos = async () => {
    if (!selectedProject) return;
    
    setVideosLoading(true);
    setShowVideoModal(true);
    
    try {
      const searchQuery = `${selectedProject.title} ${selectedProject.skills.join(' ')} project`;
      setVideoSearchQuery(searchQuery);
      
      const fetchedVideos = await youtubeService.searchVideos(searchQuery, 12);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setToast({
        message: 'Failed to load videos. Please try again.',
        type: 'error'
      });
    } finally {
      setVideosLoading(false);
    }
  };

  const handleVideoSearch = async (query: string) => {
    if (!query.trim()) return;

    setVideosLoading(true);
    setVideoSearchQuery(query);

    try {
      const fetchedVideos = await youtubeService.searchVideos(query, 12);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error searching videos:', error);
      setToast({
        message: 'Failed to search videos. Please try again.',
        type: 'error'
      });
    } finally {
      setVideosLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - videoPosition.x,
      y: e.clientY - videoPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const newWidth = Math.max(320, Math.min(resizeStart.width + deltaX, window.innerWidth - videoPosition.x));
      const newHeight = Math.max(200, Math.min(resizeStart.height + deltaY, window.innerHeight - videoPosition.y));

      setVideoSize({ width: newWidth, height: newHeight });
    } else if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - videoSize.width;
      const maxY = window.innerHeight - videoSize.height;

      setVideoPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: videoSize.width,
      height: videoSize.height
    });
  };

  const setVideoSizePreset = (width: number, height: number) => {
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    setVideoSize({ width, height });
    setVideoPosition(prev => ({
      x: Math.min(prev.x, maxX),
      y: Math.min(prev.y, maxY)
    }));
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatbotLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setChatbotLoading(true);

    try {
      const context = selectedProject ?
        `Project: ${selectedProject.title}\nDescription: ${selectedProject.description}\nSkills: ${selectedProject.skills.join(', ')}\n\n` : '';

      const response = await GeminiService.generateText(context + currentInput);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);

      if (chatMessages.length >= 8) {
        setTimeout(() => saveChatToHistory(false), 1000);
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatbotLoading(false);
    }
  };

  const generateIdeasResponse = async (input: string): Promise<string[]> => {
    if (!input.trim()) return [];
    try {
      const prompt = `Generate 5 creative and educational project ideas for children based on the following interests or keywords: "${input}".\n\nRequirements:
- Each idea should be suitable for children aged 8-14
- Include a mix of software and science projects
- Make ideas engaging and age-appropriate
- Focus on learning through fun activities
- Consider safety and supervision needs\n\nFormat each idea as a brief title followed by a short description (2-3 sentences).
Separate each idea with a blank line.`;

      const response = await GeminiService.generateText(prompt);

      const ideas = response.split('\n\n').filter(idea => idea.trim().length > 0);

      return ideas.map(idea => idea.trim()).filter(idea => idea.length > 0);
    } catch (error) {
      console.error('Error generating ideas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return [`❌ Failed to generate ideas. Please check your internet connection and try again. Error: ${errorMessage}`];
    }
  };

  const generateCodeHelperResponse = async (input: string): Promise<string> => {
    if (!input.trim()) return '';
    try {
      const prompt = `You are a helpful coding assistant for children learning to program.\n\nThe child has asked for help with: "${input}"\n\nPlease provide:
1. A clear, simple explanation of the concept or solution
2. Working code example (if applicable)
3. Step-by-step instructions
4. Common mistakes to avoid
5. Tips for testing and debugging\n\nKeep the language simple and encouraging. Use age-appropriate examples.\nIf this involves debugging, explain what might be wrong and how to fix it.
If this is a new concept, start with basics and build up.\n\nFormat your response with clear sections and code blocks where appropriate.`;

      const response = await GeminiService.generateText(prompt);
      return response || 'Sorry, I couldn\'t generate a response. Please try rephrasing your question.';
    } catch (error) {
      console.error('Error generating code snippet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `❌ Failed to generate code help. Please check your internet connection and try again. Error: ${errorMessage}`;
    }
  };

  const generateAiFeature = async (feature: 'ideas' | 'code' | 'notes' | 'plan', input?: string) => {
    let actualInput = input ?? '';
    if (feature === 'ideas') actualInput = ideasInput;
    if (feature === 'code') actualInput = codeInput;
    if (feature === 'notes') actualInput = notesInput;
    if (feature === 'plan') actualInput = planInput;

    if (!actualInput.trim() || aiLoading) return;

    if (feature === 'ideas') setProjectIdeas([]);
    if (feature === 'code') setCodeSnippet('');
    if (feature === 'notes') setProjectNotes('');
    if (feature === 'plan') setProjectPlan([]);

    setAiLoading(true);

    try {
      let response = '';
      switch(feature) {
        case 'ideas':
          const ideas = await generateIdeasResponse(actualInput);
          setProjectIdeas(ideas);
          break;
        case 'code':
          response = await generateCodeHelperResponse(actualInput);
          setCodeSnippet(response);
          break;
        case 'notes':
          const promptNotes = `You are an educational AI assistant helping children organize and understand project information. Analyze the following content and create comprehensive, structured notes:\n\nCONTENT TO ANALYZE: "${actualInput}"\n\nPROJECT CONTEXT: ${selectedProject ? `Project: ${selectedProject.title}, Skills: ${selectedProject.skills.join(', ')}, Difficulty: ${selectedProject.difficulty}` : 'General project context'}\n\nCreate structured notes with the following sections:\n\n1. **📋 KEY CONCEPTS** - Main ideas and important terms
2. **🎯 LEARNING OBJECTIVES** - What should be learned from this content
3. **📝 MAIN POINTS** - Summarized key information in bullet points
4. **🔗 CONNECTIONS** - How this relates to the project or other concepts
5. **❓ IMPORTANT QUESTIONS** - Key questions that arise from this content
6. **💡 STUDY TIPS** - How to remember and apply this information
7. **📚 RESOURCES NEEDED** - Materials or tools mentioned
8. **⏰ TIME ESTIMATES** - How long different parts might take\n\nFormat the response in a clear, organized way that's easy for children to read and study. Use emojis and formatting to make it engaging. Include practical examples and real-world applications where relevant.\n\nMake the notes comprehensive but not overwhelming - focus on the most important information that will help with the project.`;
          response = await GeminiService.generateText(promptNotes);
          setProjectNotes(response);
          break;
        case 'plan':
          const promptPlan = `You are an educational project planning assistant helping children create detailed, achievable project plans. Create a comprehensive project plan based on the following:\n\nPROJECT DESCRIPTION: "${actualInput}"\n${selectedProject ? `PROJECT DETAILS: Title: ${selectedProject.title}, Skills: ${selectedProject.skills.join(', ')}, Difficulty: ${selectedProject.difficulty}, Current Progress: ${selectedProject.progress}%` : ''}\n\nCreate a detailed project plan with the following structure:\n\n**🎯 PROJECT OVERVIEW**
- Project title and main goal
- Why this project is valuable to learn
- Expected learning outcomes\n\n**📋 DETAILED STEPS**
Break down the project into specific, actionable steps. Each step should include:
- Step number and title
- Detailed description of what to do
- Time estimate (in minutes/hours)
- Required materials or tools
- Skills needed for this step
- Potential challenges and how to overcome them
- Success criteria (how to know it's done correctly)\n\n**🛠️ MATERIALS & RESOURCES**
- Complete list of all materials needed
- Where to get materials (home, store, online)
- Cost estimates if applicable
- Alternative materials if originals aren't available\n\n**⏰ TIMELINE & MILESTONES**
- Total estimated time
- Suggested daily/weekly schedule
- Key milestones and checkpoints
- Flexibility for different paces\n\n**📚 LEARNING INTEGRATION**
- How each step builds skills
- Related concepts to research
- Extension activities for advanced learners
- Simplified versions for beginners\n\n**🔍 ASSESSMENT & NEXT STEPS**
- How to evaluate project success
- What to do if things don't go as planned
- Ideas for presenting or sharing the project
- Follow-up projects or related activities\n\n**⚠️ SAFETY & SUPERVISION NOTES**
- Any safety considerations
- When adult supervision is needed
- Age-appropriate modifications\n\nFormat this as a clear, step-by-step guide that's encouraging and supportive. Use emojis and formatting to make it engaging for children. Consider the child's age and skill level when creating the plan.`;
          response = await GeminiService.generateText(promptPlan);
          const lines = response.split('\n').filter((line: any) => line.trim());
          const steps = lines
            .filter((line: any) => /^\d+\./.test(line) || /^•/.test(line) || /^-/.test(line))
            .map((line: any) => line.replace(/^(\d+\.|•|\-)\s*/, '').trim())
            .filter((step: any) => step.length > 0);
          setProjectPlan(steps);
          break;
      }
    } catch (error) {
      console.error(`Error generating ${feature}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (feature === 'ideas') setProjectIdeas([`❌ Failed to generate ideas. Please check your internet connection and try again. Error: ${errorMessage}`]);
      if (feature === 'code') setCodeSnippet(`❌ Failed to generate code help. Please check your internet connection and try again. Error: ${errorMessage}`);
      if (feature === 'notes') setProjectNotes(`❌ Failed to generate notes summary. Please check your internet connection and try again. Error: ${errorMessage}`);
      if (feature === 'plan') setProjectPlan([`❌ Failed to generate project plan. Please check your internet connection and try again. Error: ${errorMessage}`]);
    } finally {
      setAiLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1, addedAt: new Date() }];
    });
    
    setToast({
      message: 'Item added to cart!',
      type: 'success'
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getScienceElectronicComponents = () => {
    const electronicComponents = [
      'Resistor (10Ω)', 'Resistor (100Ω)', 'Resistor (1kΩ)', 'Resistor (10kΩ)',
      'Capacitor (10µF)', 'Capacitor (100µF)', 'Capacitor (1000µF)',
      'Transistor (2N2222)', 'Transistor (BC547)', 'Diode (1N4001)', 'Zener Diode (5.1V)',
      'LED (Red)', 'LED (Green)', 'LED (Blue)', 'LED (White)', 'RGB LED',
      '9V Battery', 'AA Battery (4-pack)', 'AAA Battery (4-pack)', 'Coin Cell Battery (CR2032)',
      '9V Battery Connector', 'Battery Holder (4xAA)', 'DC Power Supply (5V)', 'DC Power Supply (12V)',
      'Push Button Switch', 'Toggle Switch', 'Slide Switch', 'Rotary Switch',
      'Micro Switch', 'Limit Switch', 'Reed Switch',
      'Temperature Sensor (DS18B20)', 'Light Sensor (LDR)', 'Motion Sensor (PIR)',
      'Sound Sensor', 'Humidity Sensor', 'Pressure Sensor', 'IR Sensor',
      'Ultrasonic Sensor', 'Gas Sensor (MQ-2)', 'Soil Moisture Sensor',
      'DC Motor (5V)', 'DC Motor (12V)', 'Servo Motor (SG90)', 'Stepper Motor',
      'Vibration Motor', 'Solenoid', 'Relay Module',
      '7-Segment Display', 'LCD Display (16x2)', 'OLED Display (0.96")',
      'LED Matrix (8x8)', 'Dot Matrix Display',
      '555 Timer IC', 'Op-Amp IC (LM358)', 'Voltage Regulator (7805)',
      'Shift Register (74HC595)', 'Arduino Nano', 'Arduino Uno', 'Raspberry Pi Pico',
      'Breadboard (400 points)', 'Breadboard (830 points)', 'Jumper Wires (Male-Male)',
      'Jumper Wires (Male-Female)', 'Jumper Wires (Female-Female)', 'Dupont Wires',
      'PCB Board', 'Soldering Iron', 'Solder Wire', 'Wire Stripper',
      'Multimeter', 'Oscilloscope (Basic)', 'Function Generator', 'Logic Analyzer',
      'USB Cable', 'Serial Cable', 'Ethernet Cable', 'Heat Shrink Tubing',
      'Arduino Starter Kit', 'Raspberry Pi 4', 'ESP32 Development Board',
      'Bluetooth Module (HC-05)', 'WiFi Module (ESP8266)', 'RF Module',
      'GPS Module', 'Accelerometer', 'Gyroscope', 'Magnetometer',
      'Potentiometer (10kΩ)', 'Variable Resistor', 'Inductor (10µH)', 'Crystal Oscillator',
      'Transformer (220V to 12V)', 'Fuse (1A)', 'Fuse Holder',
      'Buzzer', 'Speaker (8Ω)', 'Microphone', 'Audio Amplifier Module',
      'MP3 Player Module', 'Voice Recorder Module',
      'Laser Diode', 'Photo Diode', 'Photo Transistor', 'Fiber Optic Cable',
      'Optocoupler', 'Light Dependent Resistor (LDR)',
      'Solar Panel (5V)', 'Solar Panel (12V)', 'Battery Charger Module',
      'Power Bank Module', 'Voltage Booster Module', 'Voltage Regulator Module',
      'USB Connector', 'HDMI Connector', 'Audio Jack (3.5mm)', 'RCA Connector',
      'BNC Connector', 'DB9 Connector', 'GPIO Header', 'Pin Headers',
      'SD Card Module', 'EEPROM Memory', 'Flash Memory Module',
      'Real Time Clock (RTC) Module', 'Data Logger Module',
      'Serial to USB Converter', 'I2C Module', 'SPI Module', 'CAN Bus Module',
      'RS485 Module', 'LoRa Module', 'NFC Module', 'RFID Reader'
    ];

    projectTemplates
      .filter(project => project.type === 'science')
      .forEach(project => {
        if (project.content?.components) {
          project.content.components.forEach(component => {
            const electronicKeywords = ['battery', 'wire', 'led', 'switch', 'breadboard', 'resistor', 'capacitor', 'transistor', 'motor', 'sensor', 'arduino', 'raspberry', 'circuit', 'bulb', 'lamp', 'diode', 'relay', 'servo', 'potentiometer'];
            if (electronicKeywords.some(keyword => component.toLowerCase().includes(keyword)) &&
                !electronicComponents.some(existing => existing.toLowerCase().includes(component.toLowerCase()))) {
              electronicComponents.push(component);
            }
          });
        }
      });

    return electronicComponents.map((component, index) => {
      let category = 'Electronics';
      if (component.includes('Sensor') || component.includes('Module')) category = 'Sensors & Modules';
      else if (component.includes('Motor') || component.includes('Servo')) category = 'Motors & Actuators';
      else if (component.includes('Arduino') || component.includes('Raspberry') || component.includes('ESP')) category = 'Microcontrollers';
      else if (component.includes('Battery') || component.includes('Power')) category = 'Power Supply';
      else if (component.includes('Display') || component.includes('LED')) category = 'Display & Lighting';
      else if (component.includes('Wire') || component.includes('Cable') || component.includes('Connector')) category = 'Wiring & Connectors';

      let basePrice = 5;
      if (component.includes('Arduino') || component.includes('Raspberry')) basePrice = 15;
      else if (component.includes('Sensor') || component.includes('Module')) basePrice = 8;
      else if (component.includes('Motor')) basePrice = 12;
      else if (component.includes('Display')) basePrice = 10;
      else if (component.includes('Kit')) basePrice = 25;
      else if (component.includes('Battery')) basePrice = 3;
      else if (component.includes('Resistor') || component.includes('Capacitor')) basePrice = 2;

      const price = Math.floor(Math.random() * 15) + basePrice;

      return {
        id: `electronic-${index}`,
        name: component,
        price: price,
        image: getProjectImage(component),
        description: `High-quality ${component} for science projects and electronics experiments`,
        category: category,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 50) + 10,
        brand: component.includes('Arduino') ? 'Arduino' :
               component.includes('Raspberry') ? 'Raspberry Pi' :
               component.includes('ESP') ? 'Espressif' : 'Generic',
        tags: ['electronics', 'science', 'component', category.toLowerCase().replace(' & ', '-')],
        relatedProjects: projectTemplates
          .filter(p => p.type === 'science' && p.content?.components?.some(c =>
            c.toLowerCase().includes(component.split(' ')[0].toLowerCase())
          ))
          .map(p => p.id),
        averageRating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 100) + 20
      };
    });
  };

  const getFilteredProducts = () => {
    let filtered = getScienceElectronicComponents();

    if (storeSearchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(storeSearchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getFilteredProjects = (type: 'software' | 'science') => {
    let filtered = projectTemplates.filter(p => p.type === type);

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    if (projectSearchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(projectSearchQuery.toLowerCase())
      );
    }

    if (showFavouritesOnly) {
      filtered = filtered.filter(p => favourites.includes(p.id));
    }

    return filtered;
  };

  const saveChatToHistory = (clearCurrent = false) => {
    if (chatMessages.length > 1) {
      const chatToSave = [...chatMessages];
      const existingIndex = chatHistory.findIndex(
        chat =>
          chat.length === chatToSave.length &&
          chat[0]?.content === chatToSave[0]?.content
      );

      if (existingIndex === -1) {
        setChatHistory(prev => [...prev, chatToSave]);
        setToast({
          message: 'Chat saved to history!',
          type: 'success',
          duration: 3000
        });
      } else {
        setToast({
          message: 'This chat is already saved in history.',
          type: 'error',
          duration: 3000
        });
      }

      if (clearCurrent) {
        setChatMessages([]);
      }
    }
  };

  const handleBackNavigation = () => {
    saveChatToHistory(true);
    setView(previousView);
  };

  const loadChatFromHistory = (index: number) => {
    setChatMessages([...chatHistory[index]]);
    setSidebarTab('chat');
  };

  const deleteChatFromHistory = (index: number) => {
    setChatHistory(prev => prev.filter((_, i) => i !== index));
    setToast({
      message: 'Chat deleted from history!',
      type: 'success'
    });
  };

  const handleComponentClick = async (componentName: string) => {
    setIsLoadingStores(true);
    setStoreSearchResults([]);
    try {
      const searchResults = await productSearchService.searchProducts(componentName);
      setStoreSearchResults([{ component: componentName, stores: searchResults }]);
      setShowStoreModal(true);
    } catch (error) {
      console.error('Error fetching store details:', error);
      alert('Failed to fetch store details. Please try again later.');
    } finally {
      setIsLoadingStores(false);
    }
  };

  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<Store[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const handlePlaceSearch = async () => {
    if (!placeSearchQuery.trim()) return;
    setIsSearchingPlaces(true);
    try {
      const mapsService = getMapsService('AIzaSyDsxELRYuY9ozjzZ1wxbbe_1WiWqcDhzXY');
      const defaultLocation: UserLocation = { lat: 37.7749, lng: -122.4194 };
      const results = await mapsService.searchStores(placeSearchQuery, defaultLocation);
      setPlaceSearchResults(results);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaceSearchResults([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setToast({
        message: 'Your cart is empty!',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setShowStoreModal(false);
    setShowMapModal(true);

    const cartItems = cart.map(cartItem => {
      const product = getScienceElectronicComponents().find(p => p.id === cartItem.productId);
      return product;
    }).filter(product => product !== undefined);

    if (cartItems.length === 0) {
      setToast({
        message: 'No valid items in cart',
        type: 'error',
        duration: 3000
      });
      return;
    }

    let userLoc = userLocation;
    if (locationPermissionGranted === null || locationPermissionGranted === false) {
      userLoc = await requestLocationPermission();
    }

    if (!userLoc) {
      userLoc = { lat: 37.7749, lng: -122.4194 };
      setToast({
        message: 'Using default location. Enable location for better results.',
        type: 'error',
        duration: 4000
      });
    }

    setIsSearchingPlaces(true);
    try {
      const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');

      const searchQueries = [
        ...cartItems.map(item => `${item!.name} store`).slice(0, 3),
        'electronics store',
        'electronic components store',
        'maker store',
        'hobby electronics store'
      ];

      const allResults: Store[] = [];

      for (const query of searchQueries.slice(0, 5)) {
        try {
          const results = await mapsService.searchStores(query, userLoc);
          if (results && results.length > 0) {
            allResults.push(...results);
          }
        } catch (error) {
          console.warn(`Search failed for query "${query}":`, error);
        }
      }

      const uniqueResults = allResults.filter((store, index, self) =>
        index === self.findIndex(s => s.id === store.id)
      ).sort((a, b) => a.distance - b.distance).slice(0, 20);

      setPlaceSearchResults(uniqueResults.length > 0 ? uniqueResults : []);

      if (uniqueResults.length === 0) {
        console.info('No search results found, using fallback stores');
        const fallbackResults = mapsService.getFallbackStores(userLoc);
        setPlaceSearchResults(fallbackResults);
      }

      const cartItemNames = cartItems.map(item => item!.name).slice(0, 2).join(', ');
      setPlaceSearchQuery(`${cartItemNames}${cartItems.length > 2 ? ' and more' : ''} - electronics stores`);

    } catch (error) {
      console.warn('Error in checkout store search:', error);
      try {
        const mapsService = getMapsService(GOOGLE_MAPS_API_KEY || '');
        const fallbackResults = mapsService.getFallbackStores(userLoc);
        setPlaceSearchResults(fallbackResults);
        setPlaceSearchQuery('electronics store');
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setPlaceSearchResults([]);
      }
    } finally {
      setIsSearchingPlaces(false);
    }

    setToast({
      message: `Finding stores for ${cart.length} item${cart.length > 1 ? 's' : ''} in your cart...`,
      type: 'success',
      duration: 3000
    });
  };

  const [showMapModal, setShowMapModal] = useState(false);

  return {
    view,
    setView,
    previousView,
    setPreviousView,
    selectedProject,
    setSelectedProject,
    darkMode,
    setDarkMode,
    showLearningModeModal,
    setShowLearningModeModal,
    showChatbot,
    setShowChatbot,
    showStoreModal,
    setShowStoreModal,
    showVideoModal,
    setShowVideoModal,
    videos,
    setVideos,
    videosLoading,
    setVideosLoading,
    videoSearchQuery,
    setVideoSearchQuery,
    currentBackground,
    setCurrentBackground,
    currentPlayingVideo,
    setCurrentPlayingVideo,
    isVideoMinimized,
    setIsVideoMinimized,
    videoPosition,
    setVideoPosition,
    videoSize,
    setVideoSize,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    dragOffset,
    setDragOffset,
    resizeStart,
    setResizeStart,
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    chatbotLoading,
    setChatbotLoading,
    chatHistory,
    setChatHistory,
    sidebarTab,
    setSidebarTab,
    uploadedFiles,
    setUploadedFiles,
    projectIdeas,
    setProjectIdeas,
    codeSnippet,
    setCodeSnippet,
    projectNotes,
    setProjectNotes,
    projectPlan,
    setProjectPlan,
    aiLoading,
    setAiLoading,
    ideasInput,
    setIdeasInput,
    codeInput,
    setCodeInput,
    notesInput,
    setNotesInput,
    planInput,
    setPlanInput,
    products,
    setProducts,
    cart,
    setCart,
    nearbyStores,
    setNearbyStores,
    storeSearchQuery,
    setStoreSearchQuery,
    locationPermissionGranted,
    setLocationPermissionGranted,
    userLocation,
    setUserLocation,
    isRequestingLocation,
    setIsRequestingLocation,
    isLoadingStores,
    setIsLoadingStores,
    storeSearchResults,
    setStoreSearchResults,
    productSearchQuery,
    setProductSearchQuery,
    productSearchResults,
    setProductSearchResults,
    isProductSearching,
    setIsProductSearching,
    selectedProductCategory,
    setSelectedProductCategory,
    productSearchHistory,
    setProductSearchHistory,
    projectSearchQuery,
    setProjectSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    toast,
    setToast,
    showShareModal,
    setShowShareModal,
    showCodeModal,
    setShowCodeModal,
    favourites,
    setFavourites,
    showFavouritesOnly,
    setShowFavouritesOnly,
    navigate,
    location,
    youtubeService,
    productSearchService,
    autoSearchTimeout,
    toggleFavourite,
    isFavourite,
    requestLocationPermission,
    fetchNearbyStores,
    handleLearningModeSelect,
    handleWatchVideos,
    handleVideoSearch,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleResizeStart,
    setVideoSizePreset,
    handleChatSubmit,
    generateIdeasResponse,
    generateCodeHelperResponse,
    generateAiFeature,
    addToCart,
    updateCartQuantity,
    getScienceElectronicComponents,
    getFilteredProducts,
    getCartTotal,
    getFilteredProjects,
    saveChatToHistory,
    handleBackNavigation,
    loadChatFromHistory,
    deleteChatFromHistory,
    handleComponentClick,
    placeSearchQuery,
    setPlaceSearchQuery,
    placeSearchResults,
    setPlaceSearchResults,
    isSearchingPlaces,
    setIsSearchingPlaces,
    handlePlaceSearch,
    handleCheckout,
    showMapModal,
    setShowMapModal,
  };
};
