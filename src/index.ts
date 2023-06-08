import { input, select } from "@inquirer/prompts";
import * as dotenv from "dotenv";
import { getMonthName, selectInvoiceMonth } from "./dates";
import {addDays, endOfMonth} from 'date-fns'

dotenv.config();
const { env } = process;
const TAX = parseFloat(env.TAX!!);

const BANK_ACCOUNT = env.BANK_ACCOUNT;
const PAYMENT_TYPE = env.PAYMENT_TYPE;

interface Contact {
  name: string;
  address1: string;
  address2: string;
  IC: string;
  DIC: string;
}

interface Invoice {
  units: string;
  amount: number;
  item: string;
  rate: number;
  total: number;
  totalWithTax: number;
  dates: {
    creation: Date;
    payment: Date;
    taxFullfilment: Date;
  }
}

function getPayees(): string[] {
  return env.PAYEES!!.split(',').map(payee => payee.trim());
}

async function main(): Promise<void> {
  const month = await selectInvoiceMonth();

  const payeeChoices = getPayees().map(payee => ({ name: payee, value: payee }));
  const payee = await select({
    message: 'Select payee:',
    choices: payeeChoices
  });

  const UNIT = env[payee + '_UNITS'];
  const ITEM_PREFIX = env[payee + '_ITEM_PREFIX']!!;
  const PAY_DAYS = parseInt(env[payee + '_PAY_DAYS']!!);

  const units = UNIT ?? await input({
    message: 'Enter units of work (MD, hours, etc.):',
    default: 'MD',
  })

  const amount = parseFloat(await input({
    message: `Enter the amount of ${UNIT}:`,
    validate: function (value: string) {
      const valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
  }))

  const rate_conf = env[payee + "_RATE"]
  const rate = rate_conf ? parseFloat(rate_conf) : parseFloat(await input({
    message: 'Enter the rate for a given unit (Press enter for default rate):',
    default: '7890',
    validate: function (value: string) {
      const valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    }
  }))

  const total = amount * rate;
  const totalWithTax = total * TAX;
  const item = `${ITEM_PREFIX} za ${getMonthName(month)} ${new Date().getFullYear()}`;
  const endOfMonthDate = endOfMonth(month);
  const paymentDate = addDays(endOfMonthDate, PAY_DAYS);

  const invoice: Invoice = {
    units, amount, item, rate, total, totalWithTax, dates: {
      creation: endOfMonthDate,
      taxFullfilment: endOfMonthDate,
      payment: paymentDate
    }
  }

  console.log(invoice);
}

main();