import moment from 'moment';

export function isAtrasada(dataVencimento) {
  if (!dataVencimento) return false;

  const vencimento = moment(dataVencimento, [
    moment.ISO_8601,
    'DD/MM/YYYY',
    'DD/MM/YYYY HH:mm',
  ]);

  if (!vencimento.isValid()) return false;

  return vencimento.isBefore(moment());
}
