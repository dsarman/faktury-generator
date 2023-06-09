export interface Contact {
    name: string;
    address: string;
    IC: string;
    DIC: string;
}

export interface Payee extends Contact {
    payDays: number;
    prefix: string;
    units?: string | boolean;
    rate?: number;
    writeItem?: boolean;
    issueDate: 'LAST_DAY_OF_MONTH' | 'CURRENT_DATE';
}

export interface Invoice {
    units: string | boolean;
    amount?: number;
    item: string;
    rate?: number;
    total: number;
    tax: number;
    totalWithTax: number;
    dates: {
        issued: Date;
        payment: Date;
        taxFullfilment: Date;
    };
}
