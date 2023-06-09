import { Contact, Payee } from './types';
import conf from './config.json';

export const TAX = conf.tax;

export const BANK_ACCOUNT = conf.source.account!!;
export const PAYMENT_TYPE = conf.source.payment_type!!;
export const LOCALE = conf.locale!!;

export const getSource = (): Contact => {
    return {
        name: conf.source.name!!,
        address: conf.source.address!!,
        IC: conf.source.ic!!,
        DIC: conf.source.dic!!,
    };
};

export const getPayees = (): Payee[] => {
    return conf.payees.map((payee: any) => ({
        name: payee.name!!,
        address: payee.address!!,
        IC: payee.ic!!,
        DIC: payee.dic!!,
        payDays: payee.pay_days!!,
        prefix: payee.prefix!!,
        units: payee.units,
        rate: payee.rate,
        writeItem: payee.write_item,
        issueDate: payee.issue_date!!,
    }));
};
