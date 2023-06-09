import { input } from '@inquirer/prompts';
import { Payee } from './types';
import fs from 'fs';

// Map of payee name to field name to value
type History = Record<string, Record<string, string>>;
let history: History = {};

const loadHistory = (): void => {
    try {
        history = JSON.parse(fs.readFileSync('history.json', 'utf8'));
    } catch (e) {
        history = {};
    }
};

const saveHistory = (): void => {
    fs.writeFileSync('history.json', JSON.stringify(history));
};

loadHistory();

const getHistory = (payee: Payee, fieldName: string): string => {
    return history[payee.name]?.[fieldName] ?? '';
};

const setHistory = (payee: Payee, fieldName: string, value: string): void => {
    history[payee.name] = history[payee.name] ?? {};
    history[payee.name][fieldName] = value;
    saveHistory();
};

export const inputWithHistory = async (
    payee: Payee,
    fieldName: string,
    config: any
): Promise<string> => {
    const result = await input({
        ...config,
        default: getHistory(payee, fieldName),
    });
    setHistory(payee, fieldName, result);
    return result;
};
