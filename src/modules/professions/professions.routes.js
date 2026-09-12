const express = require('express');
const router = express.Router();
const {
  paradigms,
  getAllProfessions,
  searchProfessions,
  getProfessionById
} = require('../../shared/store');

router.get('/', (req, res) => {
  res.json({
    version: paradigms.version,
    categories: paradigms.categories,
    total: getAllProfessions().length
  });
});

router.get('/search', (req, res) => {
  const { q } = req.query;
  const results = searchProfessions(q);
  res.json({ query: q || '', count: results.length, results });
});

router.get('/:id', (req, res) => {
  const profession = getProfessionById(req.params.id);
  if (!profession) {
    return res.status(404).json({ error: 'Profissao nao encontrada' });
  }
  res.json(profession);
});

module.exports = router;
