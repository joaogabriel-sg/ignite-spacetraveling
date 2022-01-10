import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function formatDate(
  date: string,
  dateFormat = 'dd MMM yyyy'
): string {
  const parsedDate = new Date(date);

  return format(parsedDate, dateFormat, {
    locale: ptBR,
  });
}
