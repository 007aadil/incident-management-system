const { dequeue, size } = require("./queue");
const { handleSignal } = require("./incidentManager");

let processedCount = 0;

setInterval(async () => {
  let batchCount = 0;

  while (size() > 0 && batchCount < 100) {
    const signal = dequeue();

    try {
      await handleSignal(signal);
      processedCount++;
      batchCount++;
    } catch (err) {
      console.error("Failed to process signal:", err.message);
    }
  }
}, 100);

setInterval(() => {
  console.log(`Processed signals/sec: ${processedCount / 5}`);
  processedCount = 0;
}, 5000);