const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  submitVotes,
  getResults,
  getPending,
  getRadarSvg,
  getVoteStatus,
} = require('../controllers/voteController');

// All vote routes require authentication
router.use(verifyToken);

router.post('/', submitVotes);
router.get('/status', getVoteStatus);
router.get('/pending', getPending);
router.get('/results/:userId', getResults);
router.get('/results/:userId/radar', getRadarSvg);

module.exports = router;
