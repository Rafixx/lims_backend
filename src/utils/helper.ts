export const parseDate = (value?: string): Date | undefined => {
  return value ? new Date(value) : undefined;
};
