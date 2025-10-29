import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  /**
   * Formato dd/MM/yyyy
   */
  formatToDDMMYYYY(date: Date | string | null): string | null {
    if (!date) return null;

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Formato yyyy-MM-dd
   */
  formatToYYYYMMDD(date: Date | string | null): string | null {
    if (!date) return null;

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${year}-${month}-${day}`;
  }

  /**
   * Conversión flexible con Intl
   */
  formatIntl(date: Date | string | null, locale = 'es-CO'): string | null {
    if (!date) return null;
    return new Intl.DateTimeFormat(locale).format(new Date(date));
  }
}