import { Objects } from 'src/app/data/constants';
import { SearchEvent } from 'src/app/data/service/search.service';

export function formatString(fmt: string, params: any[]) {
  return fmt.replace(/{(\d+)}/g, (match, index) => {
    return typeof params[index] !== 'undefined' ? params[index] : match;
  });
}

export function getObjectIcon(event: SearchEvent): string {
  const event_type =
    event.images_info[0]?.event_type === 'person'
      ? 'people'
      : event.images_info[0].event_type;

  return Objects.find((o) => o.id === event_type)?.icon ?? '';
}
