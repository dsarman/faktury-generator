import { select } from "@inquirer/prompts";

export function getMonthName(date: Date, locale: string = process.env.LOCALE ?? "en-US" ) {
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
        choices: [{ name: lastMonthName, value: lastMonth }, { name: currentMonthName, value: currentMonth }]
    });
}
