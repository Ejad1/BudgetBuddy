const chatbotController = {
  async getChatbotResponse(req, res) {
    const { message, history } = req.body;

    // Basic validation
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    try {
      // Simulate an API call to a Hugging Face model or other AI service
      // In a real application, this is where you'd integrate with your chosen NLP model.
      console.log('Received message for chatbot:', message);
      console.log('Chat history:', history);

      // Simulate a delay and a simple echo response for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      let responseMessage = `You said: "${message}". This is a simulated response.`;

      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('bonjour')) {
        responseMessage = 'Hello there! How can I assist you with your finances today?';
      } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('aide')) {
        responseMessage = 'I can help you with budget planning, expense tracking, and financial advice. What do you need?';
      } else if (message.toLowerCase().includes('budget')) {
        responseMessage = 'Sure, I can help with that. Are you looking to create a new budget or review an existing one?';
      }

      res.json({ 
        reply: responseMessage,
        // You might also return updated history or other relevant data
      });

    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ error: 'Failed to get response from chatbot.' });
    }
  }
};

module.exports = chatbotController;
