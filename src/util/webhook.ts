import { IncomingWebhook } from "@slack/webhook";

const webhook: IncomingWebhook
  = new IncomingWebhook('https://hooks.slack.com/services/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');

export function sendWebHook(text: string): void {
  webhook.send(text).then();
}

export function sendGoogleChatMessage(text: string): void {
  const url = 'https://chat.googleapis.com/v1/spaces/AAQAcPGWYw0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=2_AjMBii5I7mUjfkOiWJP0-yJdMOJw1gW6NgxpAOySs';
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