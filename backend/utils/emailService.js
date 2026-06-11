const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, htmlContent) => {
    // On nettoie les variables AU MOMENT de l'envoi
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim().replace(/\s/g, '');

    // Ce log s'affichera dans votre terminal à chaque tentative d'inscription
    console.log(`>>> [DEBUG SMTP] Tentative avec : ${smtpUser} (MDP : ${smtpPass.length} caractères)`);

    const transporter = nodemailer.createTransport({
        host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
        port: parseInt(process.env.SMTP_PORT) || 587, // Changé à 587 (port par défaut)
        secure: false, // false pour le port 587 (STARTTLS), true pour le port 465 (SSL)
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        tls: {
            // Solution temporaire pour l'erreur de certificat auto-signé
            rejectUnauthorized: false, // À retirer en production !
            ciphers: 'SSLv3'
        }
    });

    try {
        console.log(`${smtpUser}`);
        console.log(`${smtpPass}`);
        
        if (!smtpUser || !smtpPass) {
            console.error("ERREUR : Identifiants SMTP (USER ou PASS) absents du .env");
            return false;
        }

        const info = await transporter.sendMail({
            from: `"CampusConnect" <${smtpUser}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        });
        console.log('E-mail envoyé avec succès ! ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('DÉTAIL ERREUR SMTP :', error.message);
        return false;
    }
};

module.exports = {
    sendEmail,
};