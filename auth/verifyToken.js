const { verify } = require('jsonwebtoken')

exports.verifyToken = function (req, res, next) {
  let token = req.get("authorization") 
  if (token) {
    token = token.slice(7);
      verify(token, process.env.SECRET, (err, decoded) => {
          if (err) {
              res.status(400).json({
                  statusCode: 400,
                  message: "Invalid Token, please login again",
              })
          } else {
            next()
          }
      })
  } else {
    res.status(400).json({
      statusCode: 400,
      message: "Unauthorized Request",
  })
  }
  // next();
}