const queue = [];

function enqueue(signal) {
  queue.push(signal);
}

function dequeue() {
  return queue.shift();
}

function size() {
  return queue.length;
}

module.exports = {
  enqueue,
  dequeue,
  size
};