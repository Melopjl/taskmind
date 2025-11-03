const moment = require('moment');

function safe(value) {
  return value === undefined ? null : value;
}

function formatDate(date) {
  if (!date) return null;
  return moment(date).format('DD-MM-YYYY HH:mm:ss');
}

module.exports = {
  safe,
  formatDate
};

//formato data e horas criação de eventos