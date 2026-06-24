console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

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