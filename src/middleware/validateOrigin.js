const allowedOrigin = 'http://localhost:3000/'; 

const validateOrigin = (req, res, next) => {
    const origin = req.headers['origin'] || req.headers['referer']; 
  
    if (origin && origin.startsWith(allowedOrigin)) {
      next(); 
    } else {
      return res.status(403).json({ message: 'Forbidden: Origin not allowed! Nice try!' });
    }
};

export {
    validateOrigin,
};