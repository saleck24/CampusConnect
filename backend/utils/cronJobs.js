const cron = require('node-cron');
const eventModel = require('../models/eventModel');
const { sendEmail } = require('./emailService');

const initCronJobs = () => {
    // Exécuté tous les jours à 08:00
    cron.schedule('0 8 * * *', async () => {
        console.log('>>> [CRON] Vérification des rappels d\'événements (24-48h)...');
        try {
            // Événements qui commencent entre 24h et 48h à partir de maintenant
            const upcomingEvents = await eventModel.findEventsStartingBetween(24, 48);

            if (upcomingEvents.length === 0) {
                console.log('>>> [CRON] Aucun événement prévu dans les prochaines 24-48h.');
                return;
            }

            for (const event of upcomingEvents) {
                const participants = await eventModel.getParticipants(event.id);
                if (participants.length > 0) {
                    const emails = participants.map(p => p.email).join(', ');
                    const date = new Date(event.date).toLocaleString('fr-FR');
                    
                    // On envoie en copie cachée (Bcc) pour ne pas exposer les emails
                    // ou on fait une boucle. Pour simplifier: boucle d'envoi.
                    for (const p of participants) {
                        const subject = `Rappel : L'événement "${event.title}" approche !`;
                        const htmlContent = `
                            <h2>Rappel d'événement</h2>
                            <p>Bonjour ${p.name},</p>
                            <p>Ceci est un rappel automatique pour l'événement <strong>${event.title}</strong> auquel vous êtes inscrit.</p>
                            <p><strong>Date :</strong> ${date}<br>
                            <strong>Lieu :</strong> ${event.location || 'Non spécifié'}</p>
                            <p>À très bientôt sur CampusConnect !</p>
                        `;
                        await sendEmail(p.email, subject, htmlContent);
                    }
                    console.log(`>>> [CRON] Rappels envoyés pour l'événement "${event.title}" (${participants.length} inscrits).`);
                }
            }
        } catch (error) {
            console.error('>>> [CRON] Erreur lors de l\'envoi des rappels :', error);
        }
    });
};

module.exports = { initCronJobs };
