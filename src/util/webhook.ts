import { IncomingWebhook } from "@slack/webhook";

const webhook: IncomingWebhook
  = new IncomingWebhook('https://hooks.slack.com/services/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');

export function sendWebHook(text: string): void {
  webhook.send(text).then();
}
