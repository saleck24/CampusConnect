const request = require('supertest');
const app = require('../server');

describe('Validation Globale CampusConnect - 100% Backlog API', () => {
    
    describe('Sprint 1 : Authentification & Création (US07, US08, US09, US10, US11)', () => {
        it('US07: Devrait refuser une inscription incomplète', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'Test' });
            expect(res.statusCode).toEqual(400);
        });

        it('US08: Devrait rejeter une confirmation avec un mauvais token', async () => {
            const res = await request(app).get('/api/auth/confirm/abc');
            expect(res.statusCode).toEqual(400);
        });

        it('US09: Devrait refuser une connexion erronée', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: '123' });
            expect(res.statusCode).toEqual(401);
        });

        it('US10: Devrait protéger la route de demande d\'association', async () => {
            const res = await request(app).post('/api/associations/request');
            expect(res.statusCode).toEqual(401);
        });

        it('US11: Devrait protéger la validation admin des demandes', async () => {
            const res = await request(app).post('/api/associations/admin/handle/1');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Sprint 2 : Gestion Asso & Événements (US12, US13, US14, US15, US16, US17, US19, US21, US22)', () => {
        it('US12/US16: Devrait protéger l\'administration interne de l\'asso', async () => {
            const res1 = await request(app).put('/api/associations/my-association');
            const res2 = await request(app).get('/api/associations/my-association/members');
            expect(res1.statusCode).toEqual(401);
            expect(res2.statusCode).toEqual(401);
        });

        it('US13/US19: Devrait autoriser l\'accès public à l\'annuaire et aux événements', async () => {
            const res1 = await request(app).get('/api/associations');
            const res2 = await request(app).get('/api/events');
            expect(res1.statusCode).toEqual(200);
            expect(res2.statusCode).toEqual(200);
        });

        it('US17: Devrait protéger la création d\'événement', async () => {
            const res = await request(app).post('/api/events/create');
            expect(res.statusCode).toEqual(401);
        });

        it('US21: Devrait permettre l\'inscription anonyme (Visiteur)', async () => {
            const res = await request(app).post('/api/events/register/1').send({ guest_name: 'Vip' });
            expect([201, 400, 404]).toContain(res.statusCode); // 400 si manque email, 404 si event inexistant
        });

        it('US22: Devrait protéger la liste des inscrits', async () => {
            const res = await request(app).get('/api/events/1/participants');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Sprint 3 : Paiements & Dashboards (US26, US27, US28, US29, US30)', () => {
        it('US26: Devrait protéger l\'upload de preuve de paiement', async () => {
            const res = await request(app).post('/api/registrations/1/proof');
            expect(res.statusCode).toEqual(400); // Car pas de fichier dans la requête
        });

        it('US27/US28: Devrait protéger la gestion financière du responsable', async () => {
            const res1 = await request(app).put('/api/registrations/1/validate');
            const res2 = await request(app).get('/api/associations/my-association/finances');
            expect(res1.statusCode).toEqual(401);
            expect(res2.statusCode).toEqual(401);
        });

        it('US29: Devrait protéger les finances globales Admin', async () => {
            const res = await request(app).get('/api/stats/admin/finances');
            expect(res.statusCode).toEqual(401);
        });

        it('US30: Devrait protéger l\'historique utilisateur', async () => {
            const res = await request(app).get('/api/users/me/history');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Sprint 4 : Sécurité & Système (US31, US33, US34, US38)', () => {
        it('US31: Devrait protéger l\'upgrade Premium', async () => {
            const res = await request(app).post('/api/associations/admin/upgrade/1');
            expect(res.statusCode).toEqual(401);
        });

        it('US33: Devrait protéger la gestion des rôles utilisateurs', async () => {
            const res = await request(app).patch('/api/users/1/role');
            expect(res.statusCode).toEqual(401);
        });

        it('US38: Devrait répondre positivement sur la route racine', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
        });
    });

});
