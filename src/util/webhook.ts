import { config } from "../config/env.config";

export function sendGoogleChatMessage(text: string): void {
  const url = `${config.googleChatWebhookUrl}?key=${config.googleChatApiKey}&token=${config.googleChatToken}`;
  const payload = {
    text: text,
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => console.log('Message sent successfully:', data))
    .catch(error => console.error('Error sending message:', error));
  
}