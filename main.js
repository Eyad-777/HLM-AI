const typing_form = document.querySelector('.typing_form');
const chat_list = document.querySelector('.chat_list');
const themeToggle = document.querySelector('.theme-toggle');
const quickButtons = document.querySelectorAll('.quick-btn');
const voiceButton = document.querySelector('.voice-btn');
const continueButton = document.querySelector('.continue-btn');
const avatarContainer = document.querySelector('.avatar-container');
const avatarImage = document.querySelector('.avatar-container img');
const saveChatToggle = document.querySelector('.save-chat-toggle');
const saveChatBtn = document.querySelector('.save-chat-btn');
const savedChatsOverlay = document.querySelector('.saved-chats-overlay');
const savedChatsSidebar = document.querySelector('.saved-chats-sidebar');
const closeSavedChats = document.querySelector('.close-saved-chats');
const savedChatsList = document.querySelector('.saved-chats-list');

const API_Key = 'AIzaSyBYeSnCyYVzqYzwLEkmNBQzsaVxr8Lcum4';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_Key}`;

// Confidence state to change bubble colors
let confidenceLevel = "high"; // Can be "high", "medium", "low"
let isSavingChat = false; // Flag to track if the chat is being saved
let isListening = false; // Flag to track if voice recognition is active
let originalGlowColor; // Store original glow color

// Initialize speech recognition
let recognition = null;
try {
    // Create speech recognition object
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA'; // Set language to Arabic
    recognition.continuous = false;
    recognition.interimResults = true;
    
    // Add event handlers for speech recognition
    recognition.onstart = () => {
        isListening = true;
        voiceButton.classList.add('active');
        // Preserve original glow appearance
        originalGlowColor = avatarContainer.style.boxShadow;
        // Change to red glow when listening
        avatarContainer.style.boxShadow = '0 0 20px 5px rgba(255, 0, 0, 0.5)'; // Red glow when listening
        
        // Show visual indicator that we're listening - using theme adaptive colors
        const listeningIndicator = document.createElement('div');
        listeningIndicator.classList.add('listening-indicator');
        listeningIndicator.innerHTML = 'جاري الاستماع... <div class="listening-dots"><span></span><span></span><span></span></div>';
        document.body.appendChild(listeningIndicator);
        
        // Make sure the indicator uses theme colors
        updateListeningIndicatorTheme();
    };
    
    recognition.onend = () => {
        isListening = false;
        voiceButton.classList.remove('active');
        // Restore original glow
        avatarContainer.style.boxShadow = originalGlowColor;
        
        // Remove listening indicator
        const indicator = document.querySelector('.listening-indicator');
        if (indicator) indicator.remove();
    };
    
    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        document.querySelector('.typing_input').value = speechResult;
        
        // If final result, send the message
        if (event.results[0].isFinal) {
            setTimeout(() => {
                recognition.stop();
                handleOutGoingChat();
            }, 1000);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        isListening = false;
        voiceButton.classList.remove('active');
        
        // Restore original glow
        avatarContainer.style.boxShadow = originalGlowColor;
        
        // Remove listening indicator
        const indicator = document.querySelector('.listening-indicator');
        if (indicator) indicator.remove();
        
        // Show error message
        showSaveConfirmation("حدث خطأ في التعرف على الصوت");
    };
} catch (error) {
    console.error('Speech recognition not supported', error);
    // We'll handle this in the voice button click event
}

// Function to update listening indicator to match current theme
const updateListeningIndicatorTheme = () => {
    const indicator = document.querySelector('.listening-indicator');
    if (!indicator) return;
    
    if (document.body.classList.contains('light-mode')) {
        indicator.style.backgroundColor = 'rgba(245, 245, 220, 0.8)'; // بيج background in light mode
        indicator.style.color = '#333'; // Dark text in light mode
        
        // Update dots color
        const dots = indicator.querySelectorAll('.listening-dots span');
        dots.forEach(dot => {
            dot.style.backgroundColor = '#A52A2A'; // بني dots in light mode
        });
    } else {
        indicator.style.backgroundColor = 'rgba(165, 42, 42, 0.8)'; // بني background in dark mode
        indicator.style.color = '#fff'; // Light text in dark mode
        
        // Update dots color
        const dots = indicator.querySelectorAll('.listening-dots span');
        dots.forEach(dot => {
            dot.style.backgroundColor = '#F5F5DC'; // بيج dots in dark mode
        });
    }
};

// Initialize theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('i').classList.remove('fa-moon');
    themeToggle.querySelector('i').classList.add('fa-sun');
    // Change avatar glow to brown in light mode
    avatarContainer.style.boxShadow = '0 0 20px 5px rgba(165, 42, 42, 0.5)'; // بني glow in light mode
    document.body.style.setProperty('--main-color', '#A52A2A'); // بني color for light mode
} else {
    // بني glow in dark mode
    avatarContainer.style.boxShadow = '0 0 20px 5px rgba(165, 42, 42, 0.5)'; // بني glow in dark mode
    document.body.style.setProperty('--main-color', '#A52A2A'); // بني color for dark mode
}

// Function to automatically scroll to bottom
const scrollToBottom = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};

// Change theme
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
        // Change to brown glow in light mode
        if (!isListening) {
            avatarContainer.style.boxShadow = '0 0 20px 5px rgba(165, 42, 42, 0.5)'; // بني glow
            originalGlowColor = avatarContainer.style.boxShadow;
        }
        document.body.style.setProperty('--main-color', '#A52A2A'); // بني color for light mode
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
        // Change to brown glow in dark mode
        if (!isListening) {
            avatarContainer.style.boxShadow = '0 0 20px 5px rgba(165, 42, 42, 0.5)'; // بني glow
            originalGlowColor = avatarContainer.style.boxShadow;
        }
        document.body.style.setProperty('--main-color', '#A52A2A'); // بني color for dark mode
    }
    
    // Update listening indicator if it exists
    updateListeningIndicatorTheme();
});

// Avatar animation during loading
const animateAvatar = (isLoading) => {
    if (isLoading) {
        avatarContainer.classList.add('loading');
        avatarContainer.style.transform = 'scale(1.1)';
    } else {
        avatarContainer.classList.remove('loading');
        avatarContainer.style.transform = 'scale(1)';
    }
};

// Analyze message to determine confidence level
const analyzeConfidence = (message) => {
    const lowConfidenceWords = ['maybe', 'perhaps', 'possibly', 'not sure', 'could be'];
    const messageLC = message.toLowerCase();

    if (lowConfidenceWords.some(word => messageLC.includes(word))) {
        return "low";
    } else if (messageLC.includes('probably') || messageLC.includes('generally')) {
        return "medium";
    } else {
        return "high";
    }
};

// Highlight keywords
const highlightKeywords = (text) => {
    // List of keywords to highlight
    const keywords = ['important', 'key', 'essential', 'critical', 'significant', 'fundamental', 'crucial'];

    let processedText = text;
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        processedText = processedText.replace(regex, `<span class="highlight">${keyword}</span>`);
    });

    return processedText;
};

// New function to format bold text
const formatBoldText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const genrateAPIResponse = async (div) => {
    const textElement = div.querySelector('.text');
    const userMessage = textElement.textContent;

    // Start avatar animation
    animateAvatar(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;

        // Determine confidence level
        confidenceLevel = analyzeConfidence(botResponse);

        // Remove loading message
        const loadingDiv = document.querySelector('.message.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }

        // Stop avatar animation
        animateAvatar(false);

        // Show bot response with fade-in animation
        setTimeout(() => {
            showBotResponse(botResponse);
            // Auto-scroll to bottom after showing response
            scrollToBottom();
        }, 300);

        // Show "continue writing" button if response is long
        if (botResponse.length > 200) {
            document.querySelector('.continue-indicator').style.display = 'block';
        }

    } catch(error) {
        console.error(error);
        // In case of error, remove loading message and show error message
        const loadingDiv = document.querySelector('.message.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }

        // Stop avatar animation
        animateAvatar(false);

        showBotResponse("عذرًا، حدث خطأ في معالجة طلبك.");
        // Auto-scroll to bottom even in case of error
        scrollToBottom();
    }
};

const showBotResponse = (responseText) => {
    // Highlight keywords and format bold text
    const formattedText = formatBoldText(highlightKeywords(responseText));

    // Determine confidence class based on level
    const confidenceClass = `confidence-${confidenceLevel}`;

    const html = `
    <div class="message_content">
        <img src="Robot.png" alt="">
        <p class="text ${confidenceClass}">${formattedText}</p>
    </div>
    <span class="material-symbols-outlined copy-btn">
        content_copy
    </span>`;

    const div = document.createElement('div');
    div.classList.add('message', 'incoming');
    div.innerHTML = html;
    chat_list.appendChild(div);

    // Add appearance animation
    setTimeout(() => {
        div.classList.add('show');
        // Auto-scroll to bottom after showing response
        scrollToBottom();
    }, 10);

    // Add click event for copy button
    const copyBtn = div.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
        const textToCopy = div.querySelector('.text').textContent;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Temporarily change icon to indicate text was copied
                copyBtn.textContent = 'done';
                copyBtn.style.color = '#4CAF50';

                // Return to original icon after 2 seconds
                setTimeout(() => {
                    copyBtn.textContent = 'content_copy';
                    copyBtn.style.color = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                copyBtn.textContent = 'error';
                copyBtn.style.color = '#f44336';

                setTimeout(() => {
                    copyBtn.textContent = 'content_copy';
                    copyBtn.style.color = '';
                }, 2000);
            });
    });
};

const showLoading = () => {
    const html = `
    <div class="message_content">
        <img src="Robot.png" alt="">
        <p class="text"></p>
        <div class="loading_indicoator">
            <div class="loading_Bar"></div>
            <div class="loading_Bar"></div>
            <div class="loading_Bar"></div>
        </div>
    </div>
    <span class="material-symbols-outlined">
        content_copy
    </span>`;

    const div = document.createElement('div');
    div.classList.add('message', 'incoming', 'loading');
    div.innerHTML = html;
    chat_list.appendChild(div);

    setTimeout(() => {
        div.classList.add('show');
        // Auto-scroll to bottom after showing loading indicator
        scrollToBottom();
    }, 10);
};

const handleOutGoingChat = () => {
    const userMessage = document.querySelector('.typing_input').value;

    if(!userMessage) return;

    // Hide "continue writing" button
    document.querySelector('.continue-indicator').style.display = 'none';

    const html = `
    <div class="message_content">
        <img src="user-icon.webp" alt="">
        <p class="text"></p>
    </div>`;

    const div = document.createElement('div');
    div.classList.add('message', 'outgoing');
    div.innerHTML = html;
    div.querySelector('.text').innerHTML = formatBoldText(userMessage);
    chat_list.appendChild(div);

    // Add appearance animation with small delay
    setTimeout(() => {
        div.classList.add('show');
        // Auto-scroll to bottom after showing user message
        scrollToBottom();
    }, 10);

    // Show loading indicator with smooth effect
    setTimeout(() => {
        showLoading();
        scrollToBottom();
    }, 400);

    // Generate response with delay for better experience
    setTimeout(() => {
        genrateAPIResponse(div);
    }, 1000);

    document.querySelector('.typing_input').value = '';
};

// Handle form submission
typing_form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleOutGoingChat();
});

// Quick response buttons
quickButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.typing_input').value = button.textContent;
        // Activate send button
        const sendButton = document.querySelector('.send-btn');
        sendButton.style.opacity = '1';
    });
});

// Voice input functionality
voiceButton.addEventListener('click', () => {
    if (!recognition) {
        // Speech recognition not supported
        showSaveConfirmation("المتصفح الخاص بك لا يدعم الإدخال الصوتي");
        return;
    }
    
    if (isListening) {
        // Stop listening if already active
        recognition.stop();
    } else {
        // Start listening
        try {
            recognition.start();
        } catch (error) {
            console.error('Speech recognition error:', error);
            showSaveConfirmation("حدث خطأ في بدء الإدخال الصوتي");
        }
    }
});

// "Continue writing" button
continueButton.addEventListener('click', () => {
    const loadingDiv = document.querySelector('.message.loading');
    if (!loadingDiv) {
        showLoading();
        setTimeout(() => {
            // Simulate response continuation
            showBotResponse("إليك المزيد من المعلومات حول هذا الموضوع...");
            document.querySelector('.continue-indicator').style.display = 'none';
            // Auto-scroll to bottom after continuing response
            scrollToBottom();
        }, 1500);
    }
});

// Save chat functionality
saveChatToggle.addEventListener('click', () => {
    savedChatsOverlay.classList.add('active');
    savedChatsSidebar.classList.add('active');
    loadSavedChats();
});

closeSavedChats.addEventListener('click', () => {
    savedChatsOverlay.classList.remove('active');
    savedChatsSidebar.classList.remove('active');
});

savedChatsOverlay.addEventListener('click', () => {
    savedChatsOverlay.classList.remove('active');
    savedChatsSidebar.classList.remove('active');
});

saveChatBtn.addEventListener('click', () => {
    toggleSaveChat();
});

// Toggle save chat status
const toggleSaveChat = () => {
    isSavingChat = !isSavingChat;
    if (isSavingChat) {
        saveChatBtn.classList.add('active');
        showSaveConfirmation("تم تفعيل حفظ المحادثة");
    } else {
        saveChatBtn.classList.remove('active');
        showSaveConfirmation("تم إلغاء حفظ المحادثة");
    }
};

// Show save confirmation message
const showSaveConfirmation = (message) => {
    // Remove any existing confirmation
    const existingConfirmation = document.querySelector('.save-confirmation');
    if (existingConfirmation) {
        existingConfirmation.remove();
    }

    // Create new confirmation
    const confirmationDiv = document.createElement('div');
    confirmationDiv.classList.add('save-confirmation');
    confirmationDiv.textContent = message;
    document.body.appendChild(confirmationDiv);

    // Show and hide with animation
    setTimeout(() => {
        confirmationDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        confirmationDiv.classList.remove('show');
        setTimeout(() => {
            confirmationDiv.remove();
        }, 300);
    }, 3000);
};

// Save current chat
const saveCurrentChat = () => {
    if (!isSavingChat || chat_list.children.length === 0) return;

    const messages = Array.from(chat_list.querySelectorAll('.message'));
    if (messages.length === 0) return;

    const firstUserMessage = messages.find(msg => msg.classList.contains('outgoing'));
    if (!firstUserMessage) return;

    const chatTitle = firstUserMessage.querySelector('.text').textContent.substring(0, 30) + "...";
    const chatPreview = messages[messages.length - 1].querySelector('.text').textContent.substring(0, 50) + "...";
    
    const chatData = {
        id: Date.now(),
        title: chatTitle,
        preview: chatPreview,
        date: new Date().toLocaleDateString('ar-SA'),
        messages: messages.map(msg => {
            return {
                type: msg.classList.contains('outgoing') ? 'user' : 'ai',
                text: msg.querySelector('.text').textContent
            };
        })
    };

    // Get existing saved chats
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    savedChats.push(chatData);
    localStorage.setItem('savedChats', JSON.stringify(savedChats));

    showSaveConfirmation("تم حفظ المحادثة بنجاح");
    loadSavedChats(); // Refresh the saved chats list if it's open
};

// Load saved chats
const loadSavedChats = () => {
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    savedChatsList.innerHTML = '';

    if (savedChats.length === 0) {
        savedChatsList.innerHTML = '<p style="color: var(--text-muted-dark); text-align: center; margin-top: 20px;">لا توجد محادثات محفوظة</p>';
        return;
    }

    savedChats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('saved-chat-item');
        chatItem.innerHTML = `
            <div class="saved-chat-title">${chat.title}</div>
            <div class="saved-chat-preview">${chat.preview}</div>
            <div class="saved-chat-date">${chat.date}</div>
            <div class="saved-chat-actions">
                <button class="load-chat" data-id="${chat.id}"><i class="fas fa-sync-alt"></i></button>
                <button class="delete-chat" data-id="${chat.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        savedChatsList.appendChild(chatItem);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.load-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chatId = parseInt(e.currentTarget.dataset.id);
            loadChat(chatId);
        });
    });

    document.querySelectorAll('.delete-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chatId = parseInt(e.currentTarget.dataset.id);
            deleteChat(chatId);
        });
    });
};

// Load a specific chat
const loadChat = (chatId) => {
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const chat = savedChats.find(chat => chat.id === chatId);
    
    if (!chat) return;

    // Clear current chat
    chat_list.innerHTML = '';
    
    // Load messages
    chat.messages.forEach(msg => {
        if (msg.type === 'user') {
            const html = `
            <div class="message_content">
                <img src="user-icon.webp" alt="">
                <p class="text">${formatBoldText(msg.text)}</p>
            </div>`;

            const div = document.createElement('div');
            div.classList.add('message', 'outgoing', 'show');
            div.innerHTML = html;
            chat_list.appendChild(div);
        } else {
            const html = `
            <div class="message_content">
                <img src="Robot.png" alt="">
                <p class="text">${formatBoldText(highlightKeywords(msg.text))}</p>
            </div>
            <span class="material-symbols-outlined copy-btn">
                content_copy
            </span>`;

            const div = document.createElement('div');
            div.classList.add('message', 'incoming', 'show');
            div.innerHTML = html;
            chat_list.appendChild(div);

            // Add copy functionality to the loaded messages
            const copyBtn = div.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                const textToCopy = div.querySelector('.text').textContent;
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        copyBtn.textContent = 'done';
                        copyBtn.style.color = '#4CAF50';
                        setTimeout(() => {
                            copyBtn.textContent = 'content_copy';
                            copyBtn.style.color = '';
                        }, 2000);
                    });
            });
        }
    });

    // Close sidebar
    savedChatsOverlay.classList.remove('active');
    savedChatsSidebar.classList.remove('active');
    
    // Scroll to bottom
    scrollToBottom();
};

// Delete a saved chat
const deleteChat = (chatId) => {
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
    localStorage.setItem('savedChats', JSON.stringify(updatedChats));
    
    // Reload the saved chats list
    loadSavedChats();
    showSaveConfirmation("تم حذف المحادثة");
};

// Save chat before unloading the page
window.addEventListener('beforeunload', () => {
    if (isSavingChat) {
        saveCurrentChat();
    }
});

// Auto-save feature (saves every 2 minutes if active)
setInterval(() => {
    if (isSavingChat) {
        saveCurrentChat();
    }
}, 120000); // 2 minutes

// Add CSS for voice recognition
const addVoiceCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
        .voice-btn {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .voice-btn.active {
            background-color: #FF0000; /* Red background when active */
            color: white;
            transform: scale(1); /* Remove scaling to keep same size */
        }
        
        .listening-indicator {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-weight: bold;
            animation: fadeIn 0.3s forwards;
            /* Theme colors will be set dynamically */
        }
        
        .listening-dots {
            display: flex;
            margin-right: 10px;
        }
        
        .listening-dots span {
            width: 8px;
            height: 8px;
            margin: 0 3px;
            border-radius: 50%;
            display: inline-block;
            animation: listening 1.4s infinite ease-in-out both;
            /* Color will be set dynamically */
        }
        
        .listening-dots span:nth-child(1) {
            animation-delay: 0s;
        }
        
        .listening-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .listening-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes listening {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
    `;
    document.head.appendChild(style);
};

// Animations to improve user experience
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for voice recognition
    addVoiceCSS();
    
    // Animate header elements
    const header = document.querySelector('.header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(20px)';

    setTimeout(() => {
        header.style.transition = 'all 0.8s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 300);
    
    // Initialize save button state
    isSavingChat = localStorage.getItem('isSavingChat') === 'true';
    if (isSavingChat) {
        saveChatBtn.classList.add('active');
    }
    
    // Save original glow color
    originalGlowColor = avatarContainer.style.boxShadow;
});

// Store save chat state
window.addEventListener('beforeunload', () => {
    localStorage.setItem('isSavingChat', isSavingChat);
    
    // Make sure to stop listening if navigating away
    if (isListening && recognition) {
        recognition.stop();
    }
});