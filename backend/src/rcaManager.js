const rcaStore = {};

function addRCA(incidentId, data) {
  const { rootCause, fix, prevention } = data;

  if (!rootCause || !fix || !prevention) {
    throw new Error("All RCA fields are required");
  }

  rcaStore[incidentId] = {
    rootCause,
    fix,
    prevention,
    createdAt: Date.now()
  };

  console.log(`RCA added for incident ${incidentId}`);
}

function hasRCA(incidentId) {
  return Boolean(rcaStore[incidentId]);
}

module.exports = {
  addRCA,
  hasRCA,
  rcaStore
};