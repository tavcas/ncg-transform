exports.up = (next) => {
  console.log('going up');
  next();
};

exports.down = (next) => {
  console.log('going down');
  next();
};
