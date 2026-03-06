import express from 'express';
const router = express.Router();


router.get('/', function(req, res, next) {
  res.json({'status':'successs','url':req.url});
});

router.get('/test',(req,res)=>{
  res.json('testing the route:'+req.url);
});

export default router;


