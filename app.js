// State variables and store keys
const STORAGE_KEYS = {
  LEADS: 'bradley_leads_data',
  SESSIONS: 'bradley_chat_sessions',
  CONFIG: 'bradley_bot_config'
};

// Initial Default Configurations
const DEFAULT_CONFIG = {
  chatTitle: 'Bradley Dental Helper',
  chatColor: '#0f766e',
  greetingMessage: 'Hello! Welcome to Bradley Dental Group. How can we help you achieve a beautiful, healthy smile today? 😊',
  systemPersona: 'You are a helpful, professional, and friendly dental clinic assistant for Bradley Dental Group in Bergenfield, NJ. Answer questions about procedures, hours, and offer to schedule appointments. Keep responses short and empathetic.',
  quickReplies: ['Book Appointment', 'Our Services', 'Office Hours & Location', 'Ask a Question']
};

// Initial Mock Leads (to populate dashboard on first load)
const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Eva M.',
    contact: 'eva.m@example.com / (201) 555-0143',
    service: 'Teeth Whitening',
    dateTime: 'Tuesday Morning',
    status: 'completed',
    dateAdded: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString() // 3 days ago
  },
  {
    id: 'lead-2',
    name: 'Mike A.',
    contact: 'mike.a@gmail.com',
    service: 'Dental Implants Inquiry',
    dateTime: 'Friday Afternoon',
    status: 'contacted',
    dateAdded: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1).toISOString() // 1 day ago
  },
  {
    id: 'lead-3',
    name: 'Sarah Jenkins',
    contact: '(201) 882-9904',
    service: 'Invisalign Consultation',
    dateTime: 'Next Monday 10:00 AM',
    status: 'new',
    dateAdded: new Date().toISOString() // today
  }
];

// Initial Mock Chat Sessions/Transcripts
const DEFAULT_SESSIONS = [
  {
    id: 'session-1',
    name: 'Eva M.',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toLocaleDateString(),
    messages: [
      { sender: 'bot', text: 'Hello! Welcome to Bradley Dental Group. How can we help you achieve a beautiful, healthy smile today? 😊' },
      { sender: 'user', text: 'I want to ask about teeth whitening.' },
      { sender: 'bot', text: 'We offer the premium Zoom Teeth Whitening service at our Bergenfield office! It can whiten your teeth up to 8 shades lighter in just about 1 hour. It is very safe and highly effective. Would you like to schedule an appointment for teeth whitening?' },
      { sender: 'user', text: 'Yes please' },
      { sender: 'bot', text: 'Sure! I can help you schedule an appointment. What is your full name?' },
      { sender: 'user', text: 'Eva M.' },
      { sender: 'bot', text: 'Thanks, Eva M.! Please provide your phone number or email address so our reception team can contact you.' },
      { sender: 'user', text: 'eva.m@example.com / (201) 555-0143' },
      { sender: 'bot', text: 'What is your preferred service to book?' },
      { sender: 'user', text: 'Teeth Whitening' },
      { sender: 'bot', text: 'Do you have a preferred day of the week or time (e.g., Morning, Afternoon) for your visit?' },
      { sender: 'user', text: 'Tuesday Morning' },
      { sender: 'bot', text: 'Perfect! Here\'s what we have: Name: Eva M., Contact: eva.m@example.com / (201) 555-0143, Service: Teeth Whitening, Time: Tuesday Morning. Shall I submit this booking request to the front desk?' },
      { sender: 'user', text: 'Yes' },
      { sender: 'bot', text: 'Thank you! Your appointment request has been submitted. Our receptionist will call or email you shortly to confirm your exact time slot. Have a wonderful day!' }
    ]
  },
  {
    id: 'session-2',
    name: 'Mike A.',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1).toLocaleDateString(),
    messages: [
      { sender: 'bot', text: 'Hello! Welcome to Bradley Dental Group. How can we help you?' },
      { sender: 'user', text: 'Do you do implants and how much do they cost?' },
      { sender: 'bot', text: 'Yes, we provide state-of-the-art Dental Implants! Dental implants are a permanent, natural-looking solution for missing teeth. Prices vary based on your specific case, insurance coverage, and requirements. We offer complimentary consultations to provide exact quotes, and we support CareCredit and Cherry Financing. Would you like to book a consultation?' },
      { sender: 'user', text: 'Yes book me in' }
    ]
  }
];

// App States
let appConfig = {};
let leads = [];
let sessions = [];
let activeSessionId = null;

// Chatbot Flow States
let chatState = 'idle'; // idle, collectingName, collectingContact, collectingService, collectingTime, confirming
let tempLeadData = {
  name: '',
  contact: '',
  service: '',
  time: ''
};

// UI Elements
const viewSiteBtn = document.getElementById('btn-view-site');
const viewAdminBtn = document.getElementById('btn-view-admin');
const patientSiteView = document.getElementById('patient-site-view');
const adminDashboardView = document.getElementById('admin-dashboard-view');
const adminBadgeCount = document.getElementById('admin-badge-count');

// Chatbot Widget Elements
const chatbotWidgetContainer = document.getElementById('chatbot-widget-container');
const chatbotLauncher = document.getElementById('chatbot-launcher');
const chatbotNotification = document.getElementById('chatbot-notification');
const notifCloseBtn = document.getElementById('notif-close-btn');
const widgetChatTitle = document.getElementById('widget-chat-title');
const messagesStream = document.getElementById('chatbot-messages-stream');
const chatbotInputForm = document.getElementById('chatbot-input-form');
const chatbotUserInput = document.getElementById('chatbot-user-input');
const chatbotSendBtn = document.getElementById('chatbot-send-btn');
const quickRepliesContainer = document.getElementById('chatbot-quick-replies-container');
const typingIndicator = document.getElementById('typing-indicator');
const chatbotResetBtn = document.getElementById('chatbot-reset-btn');

// File Attachment elements
const chatAttachBtn = document.getElementById('chat-attach-btn');
const chatFileInput = document.getElementById('chat-file-input');
const btnDownloadPdfTranscript = document.getElementById('btn-download-pdf-transcript');

// Admin Elements
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu .menu-item');
const dashboardSubviews = document.querySelectorAll('.dashboard-subview');
const leadsTableBody = document.getElementById('leads-table-body');
const leadsEmptyState = document.getElementById('leads-empty-state');
const transcriptSessionsList = document.getElementById('transcript-sessions-list');
const sessionsEmptyState = document.getElementById('sessions-empty-state');
const transcriptViewerHeader = document.getElementById('transcript-viewer-header');
const transcriptViewerMessages = document.getElementById('transcript-viewer-messages');
const transcriptSearch = document.getElementById('transcript-search');
const configForm = document.getElementById('chatbot-config-form');
const resetConfigBtn = document.getElementById('btn-reset-config');
const btnExportLeads = document.getElementById('btn-export-leads');

// Load Data from LocalStorage
function initData() {
  // Load Config
  const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (savedConfig) {
    appConfig = JSON.parse(savedConfig);
  } else {
    appConfig = { ...DEFAULT_CONFIG };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(appConfig));
  }

  // Load Leads
  const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
  if (savedLeads) {
    leads = JSON.parse(savedLeads);
  } else {
    leads = [...DEFAULT_LEADS];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }

  // Load Sessions
  const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (savedSessions) {
    sessions = JSON.parse(savedSessions);
  } else {
    sessions = [...DEFAULT_SESSIONS];
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  // Initialize Theme Color on Document Root
  applyConfigStyles();
}

// Apply visual styles based on Config
function applyConfigStyles() {
  document.documentElement.style.setProperty('--chatbot-color', appConfig.chatColor);
  widgetChatTitle.textContent = appConfig.chatTitle;
  
  // Fill Config form elements if active
  document.getElementById('config-chat-title').value = appConfig.chatTitle;
  document.getElementById('config-chat-color').value = appConfig.chatColor;
  document.getElementById('config-chat-color-text').value = appConfig.chatColor;
  document.getElementById('config-chat-greeting').value = appConfig.greetingMessage;
  document.getElementById('config-chat-persona').value = appConfig.systemPersona;
  document.getElementById('config-quick-replies').value = appConfig.quickReplies.join(', ');
}

// View switcher (Patient Site vs Admin Dashboard)
viewSiteBtn.addEventListener('click', () => {
  viewSiteBtn.classList.add('active');
  viewAdminBtn.classList.remove('active');
  patientSiteView.classList.add('active');
  adminDashboardView.classList.remove('active');
  // Refresh site view widget
  renderQuickReplies();
});

viewAdminBtn.addEventListener('click', () => {
  viewAdminBtn.classList.add('active');
  viewSiteBtn.classList.remove('active');
  adminDashboardView.classList.add('active');
  patientSiteView.classList.remove('active');
  
  // Load dashboard view data
  renderAnalytics();
  renderLeadsTable();
  renderTranscriptsList();
  
  // Hide badge count when admin views
  adminBadgeCount.style.display = 'none';
  adminBadgeCount.textContent = '0';
});

// Admin Sidebar Sub-Navigation
sidebarMenuItems.forEach(item => {
  item.addEventListener('click', () => {
    sidebarMenuItems.forEach(mi => mi.classList.remove('active'));
    item.classList.add('active');
    
    const targetTab = item.getAttribute('data-tab');
    dashboardSubviews.forEach(view => {
      if (view.id === targetTab) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
  });
});

/* ================= CHATBOT WIDGET LOGIC ================= */

// Open/Close Widget
chatbotLauncher.addEventListener('click', () => {
  const isOpened = chatbotWidgetContainer.classList.contains('chatbot-opened');
  if (isOpened) {
    chatbotWidgetContainer.classList.remove('chatbot-opened');
    chatbotWidgetContainer.classList.add('chatbot-closed');
  } else {
    chatbotWidgetContainer.classList.add('chatbot-opened');
    chatbotWidgetContainer.classList.remove('chatbot-closed');
    // Clear notification badge
    document.getElementById('chat-notification-badge').style.display = 'none';
    
    // Start session if empty
    if (messagesStream.children.length === 0) {
      startNewChatSession();
    }
  }
});

// Close Hover Notification
notifCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  chatbotNotification.style.display = 'none';
});

// User text input state trigger Send button
chatbotUserInput.addEventListener('input', () => {
  chatbotSendBtn.disabled = chatbotUserInput.value.trim() === '';
});

// Start a fresh chat session
function startNewChatSession() {
  messagesStream.innerHTML = '';
  activeSessionId = 'session-' + Date.now();
  chatState = 'idle';
  tempLeadData = { name: '', contact: '', service: '', time: '' };
  
  // Welcome message
  addMessageBubble('bot', appConfig.greetingMessage);
  renderQuickReplies();
}

chatbotResetBtn.addEventListener('click', () => {
  if (confirm('Start a new chat conversation?')) {
    // Save current session first
    saveCurrentSessionToDatabase();
    startNewChatSession();
  }
});

// Render Quick replies from config
function renderQuickReplies() {
  quickRepliesContainer.innerHTML = '';
  
  if (chatState === 'collectingService') {
    const services = ['Teeth Whitening', 'Dental Implants', 'Invisalign', 'Root Canal', 'Cosmetics', 'Cleanings & Checkup'];
    services.forEach(service => {
      const btn = document.createElement('button');
      btn.className = 'btn-quick-reply';
      btn.textContent = service;
      btn.addEventListener('click', () => handleUserInput(service));
      quickRepliesContainer.appendChild(btn);
    });
    return;
  }
  
  if (chatState === 'confirming') {
    const options = ['Confirm and Submit', 'Start Over'];
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-quick-reply';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleUserInput(opt));
      quickRepliesContainer.appendChild(btn);
    });
    return;
  }

  // Default quick replies
  appConfig.quickReplies.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'btn-quick-reply';
    btn.textContent = text;
    btn.addEventListener('click', () => handleUserInput(text));
    quickRepliesContainer.appendChild(btn);
  });
}

// Add message to stream UI
function addMessageBubble(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'bot' ? 'incoming' : 'outgoing'}`;
  
  // Icon/Avatar for Bot
  let avatarHTML = '';
  if (sender === 'bot') {
    avatarHTML = `
      <div class="chatbot-avatar avatar-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C11.5 2 7 5.5 7 10C7 16 12 22 12 22C12 22 17 16 17 10C17 5.5 12.5 2 12 2Z"/></svg>
      </div>
    `;
  }
  
  // Format message bubble content based on payload type
  let bubbleHTML = text;
  
  if (text.startsWith('data:image/')) {
    bubbleHTML = `<img src="${text}" class="chat-msg-image" alt="Patient Uploaded Image" onclick="window.open('${text}')">`;
  } else if (text.startsWith('data:application/pdf;') || text.includes(';base64,')) {
    const metaMatch = text.match(/name=([^;]+);/);
    const fileName = metaMatch ? decodeURIComponent(metaMatch[1]) : 'attached_document.pdf';
    bubbleHTML = `
      <a href="${text}" download="${fileName}" class="doc-attachment" title="Download Patient PDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        ${fileName}
      </a>
    `;
  }
  
  msgDiv.innerHTML = `
    ${avatarHTML}
    <div class="msg-bubble">
      ${bubbleHTML}
    </div>
  `;
  
  messagesStream.appendChild(msgDiv);
  messagesStream.scrollTop = messagesStream.scrollHeight;
  
  // Append to current active session data
  let activeSession = sessions.find(s => s.id === activeSessionId);
  if (!activeSession) {
    activeSession = {
      id: activeSessionId,
      name: tempLeadData.name || 'Anonymous Patient',
      date: new Date().toLocaleDateString(),
      messages: []
    };
    sessions.push(activeSession);
  }
  activeSession.messages.push({ sender, text });
  
  // Update session name if name became available
  if (tempLeadData.name) {
    activeSession.name = tempLeadData.name;
  }
  
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

// Show/Hide bot typing indicator
function showTyping(show) {
  typingIndicator.style.display = show ? 'flex' : 'none';
  messagesStream.scrollTop = messagesStream.scrollHeight;
}

// Handle User Input Submission
chatbotInputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatbotUserInput.value.trim();
  if (!text) return;
  
  chatbotUserInput.value = '';
  chatbotSendBtn.disabled = true;
  
  handleUserInput(text);
});

// Open chat widget with a specific user intent (booking, or specific service query)
window.openChatWithGoal = function(goal) {
  chatbotWidgetContainer.classList.remove('chatbot-closed');
  chatbotWidgetContainer.classList.add('chatbot-opened');
  document.getElementById('chat-notification-badge').style.display = 'none';
  
  if (messagesStream.children.length === 0) {
    startNewChatSession();
  }
  
  // Simulate user choosing action based on target
  let text = '';
  switch (goal) {
    case 'book': text = 'Book Appointment'; break;
    case 'whitening': text = 'Teeth Whitening Info'; break;
    case 'implants': text = 'Dental Implants Info'; break;
    case 'invisalign': text = 'Invisalign Info'; break;
    case 'root canal': text = 'Root Canal Info'; break;
    case 'cosmetics': text = 'Botox & Cosmetics Info'; break;
    case 'extractions': text = 'Extractions Info'; break;
    default: text = 'Book Appointment';
  }
  
  setTimeout(() => {
    handleUserInput(text);
  }, 300);
};

// Main Router for chatbot replies
function handleUserInput(text) {
  // Add outgoing message
  addMessageBubble('user', text);
  
  // Disable replies container while thinking
  quickRepliesContainer.innerHTML = '';
  showTyping(true);
  
  setTimeout(() => {
    showTyping(false);
    
    // Check if we are in the Lead Booking Funnel
    if (chatState !== 'idle') {
      processBookingWizard(text);
    } else {
      // Normal NLP Intent Detection
      processGeneralNLP(text);
    }
  }, 1000);
}

// NLP Engine: Map query keywords to bot responses
function processGeneralNLP(text) {
  const query = text.toLowerCase();
  
  // Booking Trigger
  if (query.includes('book') || query.includes('appointment') || query.includes('schedule') || query.includes('reserve') || query.includes('visit')) {
    chatState = 'collectingName';
    addMessageBubble('bot', 'I would be happy to help you request an appointment! Let\'s start by getting your name. What is your full name?');
    renderQuickReplies();
    return;
  }
  
  // Service-specific answers
  if (query.includes('whitening') || query.includes('zoom') || query.includes('white')) {
    addMessageBubble('bot', 'We offer professional **Zoom Teeth Whitening**! It is a clinically proven system that whitens your teeth up to 8 shades in just one 1-hour appointment. We protect your gums and apply a specialized light-activated gel. It\'s safe and produces immediate results. Would you like to book a whitening appointment?<br><br><img src="assets/whitening_result.png" class="chat-msg-image" alt="Zoom Whitening Results">');
  } 
  else if (query.includes('implant') || query.includes('implants') || query.includes('missing teeth')) {
    addMessageBubble('bot', 'Our premium **Dental Implants** act as permanent roots that support realistic ceramic crowns. They prevent bone loss and blend perfectly with your natural teeth. Implants last a lifetime with proper care! We offer flexible payment options (CareCredit, Cherry). Shall we schedule an implant consultation for you?<br><br><img src="assets/dental_implants.png" class="chat-msg-image" alt="Dental Implants Illustration">');
  }
  else if (query.includes('invisalign') || query.includes('braces') || query.includes('ortho') || query.includes('aligners') || query.includes('straighten')) {
    addMessageBubble('bot', 'We offer **Invisalign Clear Aligners**! They are virtually invisible, comfortable to wear, and can be removed when eating or brushing. They are a popular, modern alternative to traditional metal braces. Would you like to book a consultation to see if Invisalign is right for you?');
  }
  else if (query.includes('root') || query.includes('canal') || query.includes('pain') || query.includes('toothache')) {
    addMessageBubble('bot', 'If you are experiencing severe pain, tooth decay, or infection, a **Root Canal** can relieve the discomfort and save your natural tooth. Our team uses gentle, modern techniques to ensure the procedure is virtually pain-free. If this is an emergency, please call us immediately at (201) 385-6900. Would you like to book an appointment?');
  }
  else if (query.includes('botox') || query.includes('xeomin') || query.includes('cosmetic') || query.includes('facial') || query.includes('wrinkle') || query.includes('injectable') || query.includes('juvederm') || query.includes('kybella')) {
    addMessageBubble('bot', 'In addition to dental care, we provide facial cosmetic treatments including **Botox**, **Xeomin**, **Kybella** (chin contouring), and **Juvederm** dermal fillers to soften fine lines and enhance facial symmetry. Would you like to schedule an aesthetics consultation?');
  }
  else if (query.includes('extraction') || query.includes('wisdom') || query.includes('pull') || query.includes('remove')) {
    addMessageBubble('bot', 'We perform safe and gentle tooth extractions, including wisdom teeth removal. Our priority is your comfort, and we offer numbing and sedation options. Would you like to schedule an exam for an extraction?');
  }
  // Hours and Contact
  else if (query.includes('hour') || query.includes('when') || query.includes('open') || query.includes('time') || query.includes('saturday')) {
    addMessageBubble('bot', 'Our office hours are:<br>📅 **Monday - Friday**: 9:00 AM - 6:00 PM<br>📅 **Saturday**: 9:00 AM - 2:00 PM<br>📅 **Sunday**: Closed');
  }
  else if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('map') || query.includes('directions') || query.includes('bergenfield') || query.includes('office') || query.includes('clinic')) {
    addMessageBubble('bot', 'Bradley Dental Group is located in Bergenfield, NJ at:<br>📍 **35 North Washington Avenue, Bergenfield, NJ 07621**<br><br>We are right off Washington Ave with free parking behind the building.<br><br><img src="assets/clinic_lobby.png" class="chat-msg-image" alt="Bradley Dental Group Lobby">');
  }
  else if (query.includes('phone') || query.includes('contact') || query.includes('email') || query.includes('call')) {
    addMessageBubble('bot', 'You can reach our front desk team at:<br>📞 Phone: **(201) 385-6900**<br>✉️ Email: **bradleydental35@gmail.com**');
  }
  else if (query.includes('price') || query.includes('cost') || query.includes('insurance') || query.includes('finance') || query.includes('cherry') || query.includes('carecredit')) {
    addMessageBubble('bot', 'We accept most major dental insurances. To make quality care accessible, we also partner with **CareCredit** and **Cherry Financing** for low-interest monthly payments. We can provide a complete cost estimate during a diagnostic visit. Shall we book one for you?');
  }
  else if (query.includes('services') || query.includes('procedures') || query.includes('do you do')) {
    addMessageBubble('bot', 'We provide comprehensive dental care including:<br>✨ Dental Exams & Cleanings<br>✨ Zoom Teeth Whitening<br>✨ Dental Implants<br>✨ Invisalign Braces<br>✨ Root Canals & Extractions<br>✨ Botox & Juvederm Cosmetics');
  }
  else {
    // Fallback response with system prompt instructions mapped to response
    addMessageBubble('bot', 'I am here to assist with any questions about Bradley Dental Group services, address, hours, or helping you book an appointment. Would you like to schedule a visit?');
  }
  
  renderQuickReplies();
}

// Multi-step Lead Booking Engine
function processBookingWizard(text) {
  if (chatState === 'collectingName') {
    tempLeadData.name = text;
    chatState = 'collectingContact';
    addMessageBubble('bot', `Nice to meet you, **${text}**! Please provide your phone number or email address so our reception staff can contact you to confirm.`);
    renderQuickReplies();
  } 
  else if (chatState === 'collectingContact') {
    tempLeadData.contact = text;
    chatState = 'collectingService';
    addMessageBubble('bot', 'Thank you. Which service or dental concern would you like to schedule? (Or choose one of the options below)');
    renderQuickReplies();
  } 
  else if (chatState === 'collectingService') {
    tempLeadData.service = text;
    chatState = 'collectingTime';
    addMessageBubble('bot', 'Excellent. What day of the week or time preference (e.g. Wednesday mornings, Saturdays, anytime next week) works best for you?');
    renderQuickReplies();
  } 
  else if (chatState === 'collectingTime') {
    tempLeadData.time = text;
    chatState = 'confirming';
    addMessageBubble('bot', `Excellent, we are almost done! Let me verify your details:<br><br>👤 **Name:** ${tempLeadData.name}<br>📞 **Contact:** ${tempLeadData.contact}<br>🦷 **Service:** ${tempLeadData.service}<br>📅 **Preferred Time:** ${tempLeadData.time}<br><br>Should I submit this booking request?`);
    renderQuickReplies();
  } 
  else if (chatState === 'confirming') {
    if (text.toLowerCase().includes('confirm') || text.toLowerCase().includes('yes') || text.toLowerCase().includes('submit')) {
      // Create new lead
      const newLead = {
        id: 'lead-' + Date.now(),
        name: tempLeadData.name,
        contact: tempLeadData.contact,
        service: tempLeadData.service,
        dateTime: tempLeadData.time,
        status: 'new',
        dateAdded: new Date().toISOString()
      };
      
      leads.unshift(newLead);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      
      // Reset chatbot states
      chatState = 'idle';
      
      // Save current completed chat session
      saveCurrentSessionToDatabase();
      
      // Incremented lead alert to user via admin tab badging
      const unreadLeads = leads.filter(l => l.status === 'new').length;
      if (unreadLeads > 0) {
        adminBadgeCount.textContent = unreadLeads;
        adminBadgeCount.style.display = 'inline-block';
      }
      
      addMessageBubble('bot', `🎉 **All set!** Your appointment request has been logged. Our office receptionist will contact you shortly at **${tempLeadData.contact}** to finalize your appointment time. We look forward to seeing you at Bradley Dental Group!`);
    } else {
      chatState = 'idle';
      tempLeadData = { name: '', contact: '', service: '', time: '' };
      addMessageBubble('bot', 'No problem! I have cancelled that request. How else can I assist you today?');
    }
    renderQuickReplies();
  }
}

// Saves current chat widget messages log into the persistent session history list
function saveCurrentSessionToDatabase() {
  const activeSessionIndex = sessions.findIndex(s => s.id === activeSessionId);
  if (activeSessionIndex !== -1) {
    sessions[activeSessionIndex].name = tempLeadData.name || sessions[activeSessionIndex].name || 'Anonymous Patient';
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }
}

/* ================= ADMIN CONSOLE PANEL LOGIC ================= */

// Tab A: Performance Analytics renderer
function renderAnalytics() {
  const totalChats = sessions.length;
  const totalLeads = leads.length;
  const convRate = totalChats > 0 ? Math.round((totalLeads / totalChats) * 100) : 0;
  
  document.getElementById('stat-chats-count').textContent = totalChats;
  document.getElementById('stat-leads-count').textContent = totalLeads;
  document.getElementById('stat-conversion-rate').textContent = `${convRate}%`;
  
  // Custom Service Share Calculation
  const servicesCount = {};
  leads.forEach(l => {
    const sName = l.service.toLowerCase();
    if (sName.includes('whitening')) servicesCount['Teeth Whitening'] = (servicesCount['Teeth Whitening'] || 0) + 1;
    else if (sName.includes('implant')) servicesCount['Dental Implants'] = (servicesCount['Dental Implants'] || 0) + 1;
    else if (sName.includes('invisalign') || sName.includes('ortho')) servicesCount['Invisalign'] = (servicesCount['Invisalign'] || 0) + 1;
    else servicesCount['Other General'] = (servicesCount['Other General'] || 0) + 1;
  });
  
  const shareList = document.getElementById('services-share-list');
  shareList.innerHTML = '';
  
  const totalCategorized = Object.values(servicesCount).reduce((a, b) => a + b, 0) || 1;
  const categories = ['Teeth Whitening', 'Dental Implants', 'Invisalign', 'Other General'];
  
  categories.forEach(cat => {
    const val = servicesCount[cat] || 0;
    const percentage = Math.round((val / totalCategorized) * 100);
    
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${cat}</span>
      <div class="progress-container"><div class="progress-bar" style="width: ${percentage}%;"></div></div>
      <span>${percentage}%</span>
    `;
    shareList.appendChild(li);
  });
}

// Tab B: Leads Inbox renderer
function renderLeadsTable() {
  leadsTableBody.innerHTML = '';
  
  if (leads.length === 0) {
    leadsEmptyState.style.display = 'flex';
    return;
  }
  
  leadsEmptyState.style.display = 'none';
  
  leads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.id = `row-${lead.id}`;
    
    // Selected options for status drop-down
    const statusOptions = ['new', 'contacted', 'completed'].map(st => {
      const selected = lead.status === st ? 'selected' : '';
      return `<option value="${st}" ${selected}>${st.toUpperCase()}</option>`;
    }).join('');
    
    tr.innerHTML = `
      <td class="lead-name-cell">${escapeHtml(lead.name)}</td>
      <td class="lead-contact-cell">${escapeHtml(lead.contact)}</td>
      <td>${escapeHtml(lead.service)}</td>
      <td>${escapeHtml(lead.dateTime)}</td>
      <td>
        <select class="status-badge-selector status-badge ${lead.status}" onchange="changeLeadStatus('${lead.id}', this.value)">
          ${statusOptions}
        </select>
      </td>
      <td>
        <button class="btn-icon pdf-btn" onclick="downloadLeadPDF('${lead.id}')" title="Download Lead Sheet PDF" style="color: var(--primary-color); margin-right: 6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </button>
        <button class="btn-icon delete-btn" onclick="deleteLead('${lead.id}')" title="Delete lead">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    leadsTableBody.appendChild(tr);
  });
}

// Generate patient lead PDF
window.downloadLeadPDF = function(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  
  const opt = {
    margin:       15,
    filename:     `${lead.name.replace(/\s+/g, '_')}_lead_sheet.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  const element = document.createElement('div');
  element.id = 'pdf-print-template';
  element.style.display = 'block';
  element.innerHTML = `
    <div class="pdf-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${appConfig.chatColor}; padding-bottom: 15px;">
      <div class="pdf-title-area">
        <h1 style="color: ${appConfig.chatColor}; font-family: Outfit, sans-serif; font-size: 1.8rem; margin: 0 0 4px 0;">Bradley Dental Group</h1>
        <p style="margin: 0; color: #64748b; font-size: 0.85rem;">35 N Washington Ave, Bergenfield, NJ 07621 | (201) 385-6900</p>
      </div>
      <div style="text-align: right;">
        <h3 style="color: ${appConfig.chatColor}; font-size: 1.1rem; margin: 0 0 4px 0;">Patient Lead Sheet</h3>
        <p style="margin: 0; color: #64748b; font-size: 0.85rem;">ID: ${lead.id}</p>
      </div>
    </div>
    
    <div style="margin-bottom: 40px; margin-top: 30px;">
      <div class="pdf-section-title" style="color: ${appConfig.chatColor}; border-bottom: 1.5px solid ${appConfig.chatColor}; padding-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 16px; font-family: Outfit, sans-serif;">Patient Contact Details</div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.95rem;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #334155;">Full Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${lead.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #334155;">Contact Info:</td>
          <td style="padding: 10px 0; color: #0f172a;">${lead.contact}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #334155;">Date Logged:</td>
          <td style="padding: 10px 0; color: #0f172a;">${new Date(lead.dateAdded).toLocaleString()}</td>
        </tr>
      </table>
      
      <div class="pdf-section-title" style="color: ${appConfig.chatColor}; border-bottom: 1.5px solid ${appConfig.chatColor}; padding-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 16px; font-family: Outfit, sans-serif;">Request Preferences</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #334155;">Requested Treatment:</td>
          <td style="padding: 10px 0; color: ${appConfig.chatColor}; font-weight: 700;">${lead.service}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #334155;">Preferred Time Slot:</td>
          <td style="padding: 10px 0; color: #0f172a;">${lead.dateTime}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #334155;">Current Status:</td>
          <td style="padding: 10px 0;"><span style="text-transform: uppercase; font-weight: 800; font-size: 0.8rem; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px;">${lead.status}</span></td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top: 100px; border-top: 1px solid #cbd5e1; padding-top: 20px; text-align: center; font-size: 0.8rem; color: #64748b;">
      Bradley Family Dental Reception Management &bull; Private Patient Lead Document
    </div>
  `;
  
  html2pdf().from(element).set(opt).save();
};

// Global functions for inline table calls
window.changeLeadStatus = function(leadId, newStatus) {
  const leadIndex = leads.findIndex(l => l.id === leadId);
  if (leadIndex !== -1) {
    leads[leadIndex].status = newStatus;
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    renderLeadsTable();
    renderAnalytics();
  }
};

window.deleteLead = function(leadId) {
  if (confirm('Are you sure you want to delete this lead?')) {
    leads = leads.filter(l => l.id !== leadId);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    renderLeadsTable();
    renderAnalytics();
  }
};

// Export CSV utility
btnExportLeads.addEventListener('click', () => {
  if (leads.length === 0) return alert('No leads to export.');
  
  let csvContent = 'data:text/csv;charset=utf-8,Name,Contact Info,Service,Preferred Time,Status,Date Added\n';
  leads.forEach(l => {
    const row = [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.contact.replace(/"/g, '""')}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      `"${l.dateTime.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.dateAdded}"`
    ].join(',');
    csvContent += row + '\n';
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `bradley_leads_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Tab C: Chat transcripts list renderer
function renderTranscriptsList(filterText = '') {
  transcriptSessionsList.innerHTML = '';
  
  const filtered = sessions.filter(s => {
    if (!filterText) return true;
    const term = filterText.toLowerCase();
    const matchesName = s.name.toLowerCase().includes(term);
    const matchesMsg = s.messages.some(m => m.text.toLowerCase().includes(term));
    return matchesName || matchesMsg;
  });
  
  if (filtered.length === 0) {
    sessionsEmptyState.style.display = 'block';
    return;
  }
  
  sessionsEmptyState.style.display = 'none';
  
  filtered.forEach(session => {
    const li = document.createElement('li');
    li.className = 'transcript-item';
    li.id = `session-item-${session.id}`;
    
    // Get last user/bot message as snippet
    const lastMsg = session.messages[session.messages.length - 1];
    const snippet = lastMsg ? lastMsg.text : 'Empty conversation';
    
    li.innerHTML = `
      <div class="transcript-item-meta">
        <span class="transcript-item-name">${escapeHtml(session.name)}</span>
        <span class="transcript-item-time">${session.date}</span>
      </div>
      <div class="transcript-item-snippet">${escapeHtml(snippet)}</div>
    `;
    
    li.addEventListener('click', () => {
      // Toggle active states
      document.querySelectorAll('.transcript-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      displayTranscriptDetails(session);
    });
    
    transcriptSessionsList.appendChild(li);
  });
}

// Selected active session reference for PDF exports
let selectedSessionForPdf = null;

// Display single transcript details
function displayTranscriptDetails(session) {
  selectedSessionForPdf = session;
  
  // Update header content
  transcriptViewerHeader.querySelector('h3').textContent = `Chat with ${session.name}`;
  transcriptViewerHeader.querySelector('p').textContent = `Session ID: ${session.id} | Date: ${session.date} | Messages Log: ${session.messages.length}`;
  
  // Show PDF Button
  btnDownloadPdfTranscript.style.display = 'inline-flex';
  
  transcriptViewerMessages.innerHTML = '';
  
  session.messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.sender === 'bot' ? 'incoming' : 'outgoing'}`;
    
    let avatarHTML = '';
    if (msg.sender === 'bot') {
      avatarHTML = `
        <div class="chatbot-avatar avatar-sm" style="background-color: var(--primary-color);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2C11.5 2 7 5.5 7 10C7 16 12 22 12 22C12 22 17 16 17 10C17 5.5 12.5 2 12 2Z"/></svg>
        </div>
      `;
    }
    
    // Check for images or attachments
    let bubbleContent = msg.text;
    if (msg.text.startsWith('data:image/')) {
      bubbleContent = `<img src="${msg.text}" class="chat-msg-image" alt="Uploaded File" style="max-height: 120px;" onclick="window.open('${msg.text}')">`;
    } else if (msg.text.startsWith('data:application/pdf;') || msg.text.includes(';base64,')) {
      const metaMatch = msg.text.match(/name=([^;]+);/);
      const fileName = metaMatch ? decodeURIComponent(metaMatch[1]) : 'attached_document.pdf';
      bubbleContent = `
        <a href="${msg.text}" download="${fileName}" class="doc-attachment" style="padding: 8px 10px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          ${fileName}
        </a>
      `;
    }
    
    div.innerHTML = `
      ${avatarHTML}
      <div class="msg-bubble">
        ${bubbleContent}
      </div>
    `;
    
    transcriptViewerMessages.appendChild(div);
  });
  
  transcriptViewerMessages.scrollTop = transcriptViewerMessages.scrollHeight;
}

// Download session log as PDF
btnDownloadPdfTranscript.addEventListener('click', () => {
  if (!selectedSessionForPdf) return;
  
  const session = selectedSessionForPdf;
  const opt = {
    margin:       12,
    filename:     `${session.name.replace(/\s+/g, '_')}_transcript.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  const element = document.createElement('div');
  element.id = 'pdf-print-template';
  element.style.display = 'block';
  
  // Format log list without rendering base64 raw codes inside PDF
  const messageLogHtml = session.messages.map(m => {
    let textRep = m.text;
    if (m.text.startsWith('data:image/')) textRep = '[Image Attachment]';
    else if (m.text.startsWith('data:application/pdf') || m.text.includes(';base64,')) textRep = '[PDF Document Attachment]';
    
    return `
      <div class="pdf-log-msg ${m.sender === 'bot' ? 'incoming' : 'outgoing'}" style="margin-bottom: 8px; width: fit-content; max-width: 80%; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; ${m.sender === 'bot' ? 'background: #f8fafc; align-self: flex-start;' : 'background: #f0fdfa; border-color: rgba(15,118,110,0.15); align-self: flex-end;'}">
        <strong style="font-size: 0.75rem; color: #64748b; display: block; margin-bottom: 2px;">${m.sender === 'bot' ? 'Assistant' : 'Patient'}</strong>
        <span style="font-size: 0.85rem; color: #0f172a; line-height: 1.4;">${textRep}</span>
      </div>
    `;
  }).join('');
  
  element.innerHTML = `
    <div class="pdf-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${appConfig.chatColor}; padding-bottom: 15px;">
      <div class="pdf-title-area">
        <h1 style="color: ${appConfig.chatColor}; font-family: Outfit, sans-serif; font-weight: 700; margin: 0 0 4px 0;">Bradley Dental Group</h1>
        <p style="margin: 0; color: #64748b; font-size: 0.85rem;">35 N Washington Ave, Bergenfield, NJ 07621 | (201) 385-6900</p>
      </div>
      <div style="text-align: right;">
        <h3 style="color: ${appConfig.chatColor}; font-size: 1.1rem; margin: 0 0 4px 0;">Chat Transcript Log</h3>
        <p style="margin: 0; color: #64748b; font-size: 0.85rem;">Date: ${session.date}</p>
      </div>
    </div>
    
    <div class="pdf-meta-info" style="display: flex; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 0.9rem;">
      <div>
        <strong style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Patient Name</strong>
        <p style="font-weight: 600; color: #0f172a; margin-top: 2px; margin-bottom: 0;">${session.name}</p>
      </div>
      <div>
        <strong style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Session ID</strong>
        <p style="color: #0f172a; margin-top: 2px; margin-bottom: 0;">${session.id}</p>
      </div>
    </div>
    
    <div class="pdf-section-title" style="color: ${appConfig.chatColor}; border-bottom: 1.5px solid ${appConfig.chatColor}; padding-bottom: 4px; font-weight: bold; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 16px; font-family: Outfit, sans-serif;">Conversation Details</div>
    
    <div class="pdf-chat-log" style="display: flex; flex-direction: column; gap: 10px; padding: 10px 0;">
      ${messageLogHtml}
    </div>
    
    <div style="margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 0.75rem; color: #94a3b8;">
      Bradley Dental Group Helper &bull; Generated dynamically on ${new Date().toLocaleString()}
    </div>
  `;
  
  html2pdf().from(element).set(opt).save();
});

// Search bar listener for transcripts
transcriptSearch.addEventListener('input', (e) => {
  renderTranscriptsList(e.target.value);
});

// Tab D: Configuration settings forms saving
configForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = document.getElementById('config-chat-title').value.trim();
  const color = document.getElementById('config-chat-color').value;
  const greeting = document.getElementById('config-chat-greeting').value.trim();
  const persona = document.getElementById('config-chat-persona').value.trim();
  const repliesText = document.getElementById('config-quick-replies').value;
  
  // Format quick replies list
  const repliesArray = repliesText.split(',').map(item => item.trim()).filter(item => item !== '');
  
  appConfig = {
    chatTitle: title || DEFAULT_CONFIG.chatTitle,
    chatColor: color,
    greetingMessage: greeting || DEFAULT_CONFIG.greetingMessage,
    systemPersona: persona || DEFAULT_CONFIG.systemPersona,
    quickReplies: repliesArray.length > 0 ? repliesArray : DEFAULT_CONFIG.quickReplies
  };
  
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(appConfig));
  
  // Apply update styles immediately
  applyConfigStyles();
  alert('Settings saved successfully and applied to chatbot widget!');
});

// Color code synchronization in form inputs
document.getElementById('config-chat-color').addEventListener('input', (e) => {
  document.getElementById('config-chat-color-text').value = e.target.value;
});
document.getElementById('config-chat-color-text').addEventListener('input', (e) => {
  const hexPattern = /^#[0-9a-fA-F]{6}$/;
  if (hexPattern.test(e.target.value)) {
    document.getElementById('config-chat-color').value = e.target.value;
  }
});

// Reset defaults config
resetConfigBtn.addEventListener('click', () => {
  if (confirm('Reset chatbot configuration to system defaults?')) {
    appConfig = { ...DEFAULT_CONFIG };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(appConfig));
    applyConfigStyles();
  }
});

// Helper: Escape HTML strings to protect against XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// App startup initialization
window.addEventListener('DOMContentLoaded', () => {
  initData();
  
  // File Attachment handlers
  chatAttachBtn.addEventListener('click', () => {
    chatFileInput.click();
  });
  
  chatFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit base64 size to avoid browser lag - e.g. 2.5MB)
    if (file.size > 2.5 * 1024 * 1024) {
      alert('File size exceeds the 2.5MB limit. Please upload a smaller image or document.');
      chatFileInput.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      
      // Inject details into payload name if PDF
      let payload = dataUrl;
      if (file.type === 'application/pdf') {
        payload = `data:application/pdf;name=${encodeURIComponent(file.name)};base64,${dataUrl.split(',')[1]}`;
      }
      
      // Send the base64 string as user input
      addMessageBubble('user', payload);
      chatFileInput.value = '';
      
      // Chatbot thinking reply
      quickRepliesContainer.innerHTML = '';
      showTyping(true);
      
      setTimeout(() => {
        showTyping(false);
        addMessageBubble('bot', `I have successfully received and saved your attached file (**${file.name}**). Our office staff will review this document along with your appointment details. Is there anything else you'd like to share?`);
        renderQuickReplies();
      }, 1200);
    };
    reader.readAsDataURL(file);
  });
  
  // Set default notification trigger delay for landing page wow factor
  setTimeout(() => {
    const isOpened = chatbotWidgetContainer.classList.contains('chatbot-opened');
    if (!isOpened) {
      chatbotNotification.style.display = 'flex';
    }
  }, 4000); // 4 seconds delay
});
