import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function formatDate(date: string): string {
  const parsedDate = new Date(date);

  return format(parsedDate, 'dd MMM yyyy', {
    locale: ptBR,
  });
}
