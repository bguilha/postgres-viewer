const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Configuration de la connexion PostgreSQL
// Ces variables d'environnement devront être définies dans Cloud Run
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  // SSL peut être nécessaire selon la config GCE, souvent requis pour les connexions publiques
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

app.use(express.static('public'));
app.use(express.json());

// Endpoint pour tester la connexion et récupérer des données
app.get('/api/data', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Requête simple pour lister les tables si aucune requête spécifique n'est demandée
      // Cela permet de valider la connexion sans connaitre le schéma
      // Requête pour récupérer le contenu de la table research_results
      const result = await client.query(`
        SELECT summary 
        FROM research_results 
        ORDER BY id DESC
        LIMIT 1;
      `);

      // On essaie aussi d'avoir l'heure du serveur pour confirmer l'exécution dynamique
      const timeResult = await client.query('SELECT NOW() as now');

      res.json({
        status: 'success',
        serverTime: timeResult.rows[0].now,
        resultCount: result.rowCount,
        results: result.rows,
        message: 'Données récupérées avec succès de research_results'
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erreur de connexion DB:', err);
    res.status(500).json({
      status: 'error',
      message: 'Impossible de se connecter à la base de données',
      error: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
