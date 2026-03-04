const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getAllTeams, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');

router.use(verifyToken);

router.get('/', getAllTeams);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

module.exports = router;
