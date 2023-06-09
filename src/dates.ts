import { select } from '@inquirer/prompts';
import { format, parse } from 'date-fns';
import { LOCALE } from './config';

export function getMonthName(date: Date, locale: string = LOCALE ?? 'en-US') {
    return date.toLocaleString(locale, { month: 'long' });
}

export async function selectInvoiceMonth() {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    const currentMonthName = getMonthName(currentMonth);
    const lastMonthName = getMonthName(lastMonth);

    return await select({
        message: 'Select a month to create the invoice for:',
        choices: [
            { name: lastMonthName, value: lastMonth },
            { name: currentMonthName, value: currentMonth },
        ],
    });
}

export const formatDate = (date: Date): string => {
    return format(date, 'dd.MM.yyyy');
};

export const parseDate = (date: string): Date => {
    return parse(date, 'dd.MM.yyyy', new Date());
};
