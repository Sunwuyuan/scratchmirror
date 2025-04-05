import { Router } from 'express';
var router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  try {
    res.render('index', { title: 'Express' });
  } catch (error) {
    console.error('Error rendering index page:', error);
    res.status(500).send({
      message: 'An error occurred while rendering the index page.',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;
