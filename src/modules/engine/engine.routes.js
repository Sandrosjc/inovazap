const express = require('express');
const router = express.Router();
const {
  getProfessionById,
  createCustomProfession
} = require('../../shared/store');

router.post('/unlock', (req, res) => {
  const { professionId } = req.body;

  if (!professionId) {
    return res.status(400).json({ error: 'professionId e obrigatorio' });
  }

  const profession = getProfessionById(professionId);
  if (!profession) {
    return res.status(404).json({ error: 'Profissao nao encontrada' });
  }

  res.json({
    unlocked: true,
    profession: {
      id: profession.id,
      name: profession.name,
      category: profession.categoryName,
      icon: profession.categoryIcon,
      fields: profession.fields
    },
    autoAttendanceParadigms: profession.paradigms,
    whatsappWorkflows: profession.workflows,
    summary: {
      totalParadigms: profession.paradigms.length,
      totalWorkflows: profession.workflows.length,
      readyToConfigure: true
    },
    nextSteps: [
      'Conectar numero de WhatsApp',
      'Personalizar mensagens dos paradigmas',
      'Ativar workflows automaticos',
      'Convidar equipe de atendimento'
    ]
  });
});

router.post('/custom', (req, res) => {
  try {
    const custom = createCustomProfession(req.body);
    res.status(201).json({
      unlocked: true,
      custom: true,
      profession: custom,
      autoAttendanceParadigms: custom.paradigms,
      whatsappWorkflows: custom.workflows,
      summary: {
        totalParadigms: custom.paradigms.length,
        totalWorkflows: custom.workflows.length,
        readyToConfigure: true
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
