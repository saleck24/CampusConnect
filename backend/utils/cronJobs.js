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

    // Exécuté tous les jours à 00:01 pour l'expiration du Premium
    cron.schedule('1 0 * * *', async () => {
        console.log('>>> [CRON] Vérification des expirations d\'abonnements Premium...');
        try {
            const pool = require('../config/db');
            
            // 1. Récupérer les associations premium dont la date est dépassée
            const [expired] = await pool.query(
                "SELECT id, name FROM associations WHERE plan = 'premium' AND premium_until IS NOT NULL AND premium_until < NOW()"
            );

            if (expired.length === 0) {
                console.log('>>> [CRON] Aucun abonnement Premium n\'a expiré aujourd\'hui.');
                return;
            }

            for (const asso of expired) {
                console.log(`>>> [CRON] Abonnement expiré pour l'association : ${asso.name} (ID: ${asso.id})`);
                
                // Mettre à jour l'association vers le plan free et désactiver la cotisation
                await pool.query(
                    "UPDATE associations SET plan = 'free', membership_fee = 0.00 WHERE id = ?",
                    [asso.id]
                );

                // Récupérer le responsable de cette association pour lui envoyer un email
                const [members] = await pool.query(
                    `SELECT u.email, u.name 
                     FROM association_members am
                     JOIN users u ON am.user_id = u.id
                     WHERE am.association_id = ? AND u.role = 'responsable' AND am.status = 'approved'`,
                    [asso.id]
                );

                const manager = members[0];
                if (manager && manager.email) {
                    const subject = `Votre abonnement Premium sur CampusConnect a expiré`;
                    const htmlContent = `
                        <h2>Abonnement Premium expiré</h2>
                        <p>Bonjour ${manager.name},</p>
                        <p>Nous vous informons que l'abonnement Premium pour votre association <strong>${asso.name}</strong> a expiré.</p>
                        <p>Votre association a été repassée en plan gratuit. Pour réactiver le mode Premium et retrouver l'accès complet à vos fonctionnalités avancées (événements payants, cotisations, statistiques), veuillez contacter un administrateur.</p>
                        <p>L'équipe CampusConnect</p>
                    `;
                    await sendEmail(manager.email, subject, htmlContent);
                }
            }
        } catch (error) {
            console.error('>>> [CRON] Erreur lors du traitement des expirations Premium :', error);
        }
    });
};

module.exports = { initCronJobs };
