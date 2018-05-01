const bigint = require("big-integer");

const sequenceBits = 12;
const workerIdBits = 5;
const datacenterIdBits = 5;

const workerIdShift = sequenceBits;
const datacenterIdShift = workerIdShift + workerIdBits;
const timestampShift = datacenterIdShift + datacenterIdBits;

const parse = tid => {
  const id = bigint(tid);
  return {
    id: tid,
    sequence: id.mod(2 ** sequenceBits).toJSNumber(),
    workerId: id
      .shiftRight(workerIdShift)
      .mod(2 ** workerIdBits)
      .toJSNumber(),
    datacenterId: id
      .shiftRight(datacenterIdShift)
      .mod(2 ** datacenterIdBits)
      .toJSNumber(),
    timestamp: id.shiftRight(timestampShift).toJSNumber()
  };
};

const create = ({ sequence, workerId, datacenterId, timestamp }) => {
  return bigint(timestamp)
    .shiftLeft(datacenterIdBits)
    .add(datacenterId)
    .shiftLeft(workerIdBits)
    .add(workerId)
    .shiftLeft(sequenceBits)
    .add(sequence)
    .toString();
};

exports.parse = parse;
exports.create = create;
