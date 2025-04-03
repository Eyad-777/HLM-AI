const typing_form = document.querySelector('.typing_form');
const chat_list = document.querySelector('.chat_list');
const themeToggle = document.querySelector('.theme-toggle');
const quickButtons = document.querySelectorAll('.quick-btn');
const voiceButton = document.querySelector('.voice-btn');
const continueButton = document.querySelector('.continue-btn');
const avatarContainer = document.querySelector('.avatar-container');
const avatarImage = document.querySelector('.avatar-container img');

const API_Key = 'AIzaSyBYeSnCyYVzqYzwLEkmNBQzsaVxr8Lcum4';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_Key}`;

// Confidence state to change bubble colors
let confidenceLevel = "high"; // Can be "high", "medium", "low"

// Initialize theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('i').classList.remove('fa-moon');
    themeToggle.querySelector('i').classList.add('fa-sun');
    // Change avatar image in light mode
    avatarImage.src = "Robot.png";
    avatarContainer.style.boxShadow = '0 0 20px 5px rgba(245, 245, 220, 0.5)'; // بيج glow in light mode
    document.body.style.setProperty('--main-color', '#F5F5DC'); // بيج color for light mode
} else {
    // Ensure dark image is set by default
    avatarImage.src = "Robot.png";
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
        // Change to light mode image and glow
        avatarImage.src = "Robot.png";
        avatarContainer.style.boxShadow = '0 0 20px 5px rgba(245, 245, 220, 0.5)'; // بيج glow
        document.body.style.setProperty('--main-color', '#F5F5DC'); // بيج color for light mode
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
        // Change to dark mode image and glow
        avatarImage.src = "Robot.png";
        avatarContainer.style.boxShadow = '0 0 20px 5px rgba(165, 42, 42, 0.5)'; // بني glow
        document.body.style.setProperty('--main-color', '#A52A2A'); // بني color for dark mode
    }
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
    // Highlight keywords
    const highlightedText = highlightKeywords(responseText);

    // Determine confidence class based on level
    const confidenceClass = `confidence-${confidenceLevel}`;

    const html = `
    <div class="message_content">
        <img src="Robot.png" alt="">
        <p class="text ${confidenceClass}">${highlightedText}</p>
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
    div.querySelector('.text').textContent = userMessage;
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

// Simulate voice input functionality
voiceButton.addEventListener('click', () => {
    voiceButton.classList.add('active');
    // Just show a message indicating this feature is coming soon
    setTimeout(() => {
        voiceButton.classList.remove('active');
        alert('ميزة الإدخال الصوتي قادمة قريبًا!');
    }, 1000);
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

// Animations to improve user experience
document.addEventListener('DOMContentLoaded', () => {
    // Animate header elements
    const header = document.querySelector('.header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(20px)';

    setTimeout(() => {
        header.style.transition = 'all 0.8s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 300);
});