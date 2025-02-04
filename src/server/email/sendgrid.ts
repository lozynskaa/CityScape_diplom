import sgMail from "@sendgrid/mail";

interface EmailData {
  to: string; // Recipient email(s)
  subject: string; // Subject of the email
  text: string; // Plaintext body of the email
  html: string; // HTML body of the email
  from?: string; // Sender email (optional, defaults to configured sender)
}

export class SendGridService {
  private defaultSender: string;

  constructor(apiKey: string, defaultSender: string) {
    sgMail.setApiKey(apiKey);
    this.defaultSender = defaultSender;
  }

  /**
   * Sends an email using SendGrid.
   * @param emailData Email details including recipient, subject, and content.
   */
  async sendEmail(emailData: EmailData): Promise<void> {
    const { to, subject, text, html, from } = emailData;

    const message = {
      to,
      from: from ?? this.defaultSender,
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(message);
      console.log(`Email sent to: ${to}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending email:", error.message || error);
      }
      throw new Error("Failed to send email.");
    }
  }

  async onEventApply(userEmail: string, eventName: string): Promise<void> {
    // Send a confirmation email
    await this.sendEmail({
      to: userEmail,
      subject: "Application Confirmation",
      text: `You have successfully applied to the event "${eventName}".`,
      html: `<p>You have successfully applied to the event "<strong>${eventName}</strong>".</p>`,
    });

    console.log(`User ${userEmail} applied to event ${eventName}`);
  }
  async onEventUpdate(
    userEmail: string,
    eventName: string,
    status: "update" | "cancel",
  ): Promise<void> {
    // Send a email about event update with link to event, to check all details
    await this.sendEmail({
      to: userEmail,
      subject: "Event Update",
      text: `The event "${eventName}" has been ${status === "cancel" ? "cancelled" : "updated"}.`,
      html: `<p>The event "<strong>${eventName}</strong>" has been ${status === "cancel" ? "cancelled" : "updated"}. Please check the details.</p>`,
    });

    console.log(`User ${userEmail} applied to event ${eventName}`);
  }
  async onGoalReach(email: string, eventName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: "Donation Goal Reached!",
      text: `Congratulations! The donation goal for your event "${eventName}" has been reached.`,
      html: `<p>Congratulations! The donation goal for your event "<strong>${eventName}</strong>" has been reached.</p>`,
    });
  }
}

export const sgService = new SendGridService(
  process.env.SENDGRID_API_KEY!,
  process.env.SENDGRID_DEFAULT_SENDER!,
);
