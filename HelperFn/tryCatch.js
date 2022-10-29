// function wrapperFn(fn) {
//   try {
//     fn(req, res, next).next();
//   } catch (error) {
//     next(e);
//   }
// }

function wrapperFn(fn) {
  {
    return function (req, res, next) {
      fn(req, res, next).catch((e) => next(e));
    };
  }
}
module.exports = { wrapperFn: wrapperFn };
