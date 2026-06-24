import nodemailer from "nodemailer";
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);

export const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP Verify Error:", error);
    } else {
        console.log("SMTP Server is ready", success);
    }
});

const sendEmail = async ({
    to,
    subject,
    body,
}: {
    to: string;
    subject: string;
    body: string;
}) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY!,
        },
        body: JSON.stringify({
            sender: {
                email: process.env.SMTP_USER,
                name: "E-Grocery Delivey",
            },
            to: [{ email: to }],
            subject,
            htmlContent: body,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }

    return response.json();
};

export default sendEmail;
