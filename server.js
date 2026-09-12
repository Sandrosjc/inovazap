const express = require('express');
const cors = require('cors');
const path = require('path');

const professionsRoutes = require('./src/modules/professions/professions.routes');
const engineRoutes = require('./src/modules/engine/engine.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', app: 'Inova Zap SaaS', version: '1.0.0' });
});

app.use('/api/professions', professionsRoutes);
app.use('/api/engine', engineRoutes);

app.listen(PORT, () => {
  console.log('Inova Zap rodando na porta ' + PORT);
});
