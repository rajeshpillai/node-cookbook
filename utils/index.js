const utils = {
  sleep: sleep
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = utils;