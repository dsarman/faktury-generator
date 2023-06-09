import { getSource } from './config';
import { getInvoice } from './input';
import { getPdf } from './pdf';

const main = async (): Promise<void> => {
    const { invoice, payee } = await getInvoice();
    console.log(invoice);
    getPdf(invoice, getSource(), payee);
};

main();
