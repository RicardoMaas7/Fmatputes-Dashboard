const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  submitVotes,
  getResults,
  getPending,
  getRadarSvg,
  getVoteStatus,
  uploadRadarOverride,
  importVotesCsv,
} = require('../controllers/voteController');

// All vote routes require authentication
router.use(verifyToken);

router.post('/', submitVotes);
router.get('/status', getVoteStatus);
router.get('/pending', getPending);
router.get('/results/:userId', getResults);
router.get('/results/:userId/radar', getRadarSvg);

// Admin-only routes
router.post('/radar-override', uploadRadarOverride);
router.post('/import-csv', importVotesCsv);

module.exports = router;
