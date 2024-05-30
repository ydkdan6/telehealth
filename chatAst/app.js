document.addEventListener('DOMContentLoaded', () => {
    const userMessageInput = document.getElementById('userMessage');
    const sendMessageButton = document.getElementById('sendMessageButton');
    const messagesContainer = document.getElementById('messages');

    sendMessageButton.addEventListener('click', async () => {
        const userMessage = userMessageInput.value.trim();
        
        if (userMessage === "") {
            alert("Please enter your symptoms.");
            return;
        }

        // Display user's message
        displayMessage(userMessage, 'user-message');

        // Prepare API request payload
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': '3557ccf150msh52a05552dd8a263p100aeejsn92a745277da1',
                'X-RapidAPI-Host': 'chatgpt-42.p.rapidapi.com'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                web_access: false
            })
        };

        try {
            const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4', payload);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            // Display the bot's response
            displayMessage(result.result || "No response received.", 'bot-message');
        } catch (error) {
            console.error(error);
            displayMessage("An error occurred while processing your request. Please try again.", 'bot-message');
        }

        userMessageInput.value = ''; // Clear the input
    });

    function displayMessage(message, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
    }
});
