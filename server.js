const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', app: 'Inova Zap SaaS', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Inova Zap rodando na porta ${PORT}`);
});
