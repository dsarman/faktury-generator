import { input, select } from '@inquirer/prompts';
import { addDays, endOfMonth } from 'date-fns';
import { TAX, getPayees } from './config';
import {
    formatDate,
    getMonthName,
    parseDate,
    selectInvoiceMonth,
} from './dates';
import { inputWithHistory } from './history';
import { Invoice, Payee } from './types';

const validateNum = (value: string) => {
    const valid = !isNaN(parseFloat(value));
    return valid || 'Please enter a number';
};

export const getInvoice = async (): Promise<{
    invoice: Invoice;
    payee: Payee;
}> => {
    const month = await selectInvoiceMonth();

    const payeeChoices = getPayees().map((payee) => ({
        name: payee.name,
        value: payee,
    }));
    const payee = await select({
        message: 'Select payee:',
        choices: payeeChoices,
    });

    let units = payee.units;
    if (units == undefined) {
        units = await inputWithHistory(payee, 'units', {
            message: 'Enter units of work (MD, hours, etc.):',
        });
    }

    let rate = payee.rate;
    let amount;
    let total = 0;
    if (units !== false) {
        amount = parseFloat(
            await inputWithHistory(payee, 'amount', {
                message: `Enter the amount of ${units}:`,
                validate: validateNum,
            })
        );
        rate =
            rate ??
            parseFloat(
                await inputWithHistory(payee, 'rate', {
                    message: 'Enter the rate for a given unit:',
                    validate: validateNum,
                })
            );
        total = amount * rate;
    } else {
        total = parseFloat(
            await inputWithHistory(payee, 'total', {
                message: 'Enter the total amount:',
            })
        );
    }
    const tax = total * (TAX - 1);
    const totalWithTax = total + tax;
    let itemText = '';
    if (payee.writeItem) {
        itemText = await inputWithHistory(payee, 'item', {
            message: 'Enter the invoiced item text:',
        });
    } else {
        itemText = `${getMonthName(month)} ${new Date().getFullYear()}`;
    }

    const item = `${payee.prefix} ${itemText}`;
    let issuedConf;
    if (payee.issueDate === 'LAST_DAY_OF_MONTH') {
        issuedConf = endOfMonth(month);
    } else if (payee.issueDate === 'CURRENT_DATE') {
        issuedConf = new Date();
    } else {
        throw new Error('Invalid issue date');
    }

    const issued = parseDate(
        await input({
            message: 'Enter the issue date:',
            default: formatDate(issuedConf),
        })
    );

    const payment = addDays(issuedConf, payee.payDays);

    const invoice: Invoice = {
        units,
        amount,
        item,
        rate,
        total,
        totalWithTax,
        tax,
        dates: {
            issued,
            taxFullfilment: issued,
            payment,
        },
    };

    return { invoice, payee };
};
