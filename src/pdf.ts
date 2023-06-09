import { Contact, Invoice } from './types';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { BANK_ACCOUNT, LOCALE, PAYMENT_TYPE, TAX } from './config';
import format from 'date-fns/format';
import { formatDate } from './dates';

const font = {
    size: {
        large: 22,
        big: 18,
        medium: 14,
        small: 11,
    },
    weight: {
        bold: 'fonts/Nunito-Bold.ttf',
        regular: 'fonts/Nunito-Regular.ttf',
        semibold: 'fonts/Nunito-SemiBold.ttf',
    },
    color: {
        gray: '#415a77',
        black: '#0d1b2a',
    },
};

const MID = 330;
const START = 40;
const GAP = 130;
const LINE = 16;
const TAX_PERCENT = TAX * 100 - 100;

const formatCurrency = (amount: number) => {
    return (
        amount.toLocaleString(LOCALE, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + ' Kč'
    );
};

export const getPdf = (
    invoice: Invoice,
    source: Contact,
    destination: Contact
) => {
    const doc = new PDFDocument();
    let line = 60;
    doc.pipe(fs.createWriteStream('output.pdf'));

    doc.font(font.weight.bold)
        .fontSize(font.size.large)
        .fillColor(font.color.black)
        .text('Faktura', MID, line);
    doc.font(font.weight.regular)
        .fontSize(font.size.small)
        .fillColor(font.color.gray);
    line += 2 * LINE;
    doc.text('Daňový doklad', MID, line);
    line += 2 * LINE;

    doc.text('Dodavatel', START, line);
    doc.text('Odběratel', MID, line);

    // Name
    line += 1.5 * LINE;
    doc.font(font.weight.bold)
        .fontSize(font.size.medium)
        .fillColor(font.color.black)
        .text(source.name, START, line);
    doc.text(destination.name, MID, line);

    // Address
    const splitAndTrimAddress = (address: string) => {
        return address.split(',').map((line) => line.trim());
    };

    const sourceAdressess = splitAndTrimAddress(source.address);
    const destinationAddresses = splitAndTrimAddress(destination.address);

    line += 1.2 * LINE;
    doc.font(font.weight.regular)
        .fontSize(font.size.small)
        .fillColor(font.color.gray);
    doc.text(sourceAdressess[0], START, line);
    doc.text(destinationAddresses[0], MID, line);
    line += LINE;
    doc.text(sourceAdressess[1], START, line);
    doc.text(destinationAddresses[1], MID, line);

    // IČ
    line += 1.5 * LINE;
    doc.text('IČ', START, line);
    doc.fillColor(font.color.black).text(source.IC, START + GAP, line);
    doc.fillColor(font.color.gray).text('IČ', MID, line);
    doc.fillColor(font.color.black).text(destination.IC, MID + GAP, line);

    // DIČ
    line += LINE;
    doc.fillColor(font.color.gray).text('DIČ', START, line);
    doc.fillColor(font.color.black).text(source.DIC, START + GAP, line);
    doc.fillColor(font.color.gray).text('DIČ', MID, line);
    doc.fillColor(font.color.black).text(destination.DIC, MID + GAP, line);

    doc.fillColor(font.color.gray);
    line += 2 * LINE;
    doc.fillColor(font.color.gray).text('Bankovní účet', START, line);
    doc.fillColor(font.color.black).text(BANK_ACCOUNT, START + GAP, line);
    doc.fillColor(font.color.gray).text('Datum vystavení', MID, line);
    doc.fillColor(font.color.black).text(
        formatDate(invoice.dates.issued),
        MID + GAP,
        line
    );

    line += LINE;
    doc.fillColor(font.color.gray).text('Způsob platby', START, line);
    doc.fillColor(font.color.black).text(PAYMENT_TYPE, START + GAP, line);
    doc.fillColor(font.color.gray).text('Datum splatnosti', MID, line);
    doc.fillColor(font.color.black).text(
        formatDate(invoice.dates.payment),
        MID + GAP,
        line
    );

    line += LINE;
    doc.fillColor(font.color.gray).text('Datum zdan. plnění', MID, line);
    doc.fillColor(font.color.black).text(
        formatDate(invoice.dates.taxFullfilment),
        MID + GAP,
        line
    );

    line += 3 * LINE;
    doc.fillColor(font.color.black);
    doc.text('DPH', MID + (invoice?.rate ? 0 : 60), line);
    if (invoice.rate) {
        doc.text('Cena za MJ', MID + 40, line);
    }
    doc.text(
        invoice.rate ? 'Celkem bez DPH' : 'Cena',
        MID + (invoice?.rate ? 125 : 135),
        line
    );

    line += 1.1 * LINE;
    doc.strokeColor(font.color.gray)
        .moveTo(START, line)
        .lineTo(550, line)
        .stroke();

    line += 0.4 * LINE;
    if (invoice.rate && typeof invoice.units === 'string' && invoice.amount) {
        doc.text(invoice.amount.toString(), START, line);
        doc.text(invoice.units, START + 30, line);
    }
    doc.text(invoice.item, START + (invoice.rate ? 60 : 0), line, {
        width: invoice.rate ? 200 : 340,
    });
    doc.text(`${TAX_PERCENT} %`, MID + (invoice?.rate ? 0 : 60), line);

    if (invoice.rate) {
        doc.text(formatCurrency(invoice.rate), MID + 40, line);
    }
    doc.text(
        formatCurrency(invoice.total),
        MID + (invoice?.rate ? 125 : 135),
        line
    );

    line += 2.3 * LINE;
    doc.strokeColor(font.color.gray)
        .moveTo(START, line)
        .lineTo(550, line)
        .stroke();

    line += 2 * LINE;
    doc.fillColor(font.color.gray).text('Celkem bez DPH', MID, line);
    doc.fillColor(font.color.black).text(
        formatCurrency(invoice.total),
        MID + 120,
        line,
        { align: 'right' }
    );

    line += LINE;
    doc.fillColor(font.color.gray).text(`DPH ${TAX_PERCENT} %`, MID, line);
    doc.fillColor(font.color.black).text(
        formatCurrency(invoice.tax),
        MID + 120,
        line,
        { align: 'right' }
    );

    line += LINE;
    doc.strokeColor(font.color.gray)
        .moveTo(MID - 20, line)
        .lineTo(540, line)
        .stroke();

    line += 0.1 * LINE;
    doc.font(font.weight.semibold)
        .fontSize(font.size.big)
        .fillColor(font.color.black);
    doc.text(formatCurrency(invoice.totalWithTax), MID, line, {
        align: 'right',
    });

    line += 2 * LINE;
    doc.fillColor(font.color.gray)
        .fontSize(font.size.small)
        .text('Fyzická osoba zapsaná v živnostenském rejstříku.', START, 700);

    doc.end();
};
