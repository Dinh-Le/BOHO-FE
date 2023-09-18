export function formatString(fmt: string, params: any[]) {
  return fmt.replace(/{(\d+)}/g, (match, index) => {
    return typeof params[index] !== 'undefined' ? params[index] : match;
  });
}
