// function wrapperFn(fn) {
//   try {
//     fn(req, res, next).next();
//   } catch (error) {
//     next(e);
//   }
// }

function wrapperFn(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

// function wrapperFn(fn) {
//   return async function (req, res, next) {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// }

module.exports = wrapperFn;
