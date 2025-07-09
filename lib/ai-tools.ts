import { getLatestTransaction } from './actions/transaction.actions';
import { getTopRecipient } from './actions/recipient.actions';
import { getBanko } from './actions/bank.actions';
import { getBalance } from './actions/user.actions';
import { getUserReport } from './actions/report.actions';

export type ToolName =  'getUserReport' | 'getLastTransaction' | 'getTopRecipient' | 'getUserBanks' | 'getBalance';

export const tools: Record<ToolName, (userId: string) => Promise<string>> = {
    getUserReport: async (userId: string) => {
        const report = await getUserReport({ userId });

        return `Here is your financial report:\n
        - Total Sent: $${report.totalSent}
        - Total Received: $${report.totalReceived}
        - Current Balance: $${report.balance}`;
    },
    getLastTransaction: async (userId: string) => {
        const tx = await getLatestTransaction({ userId });

        if (!tx) return "You haven't made or received any transactions yet.";

        return `Your latest transaction was a ${tx.type} of ${tx.amount} ${tx.currency} with "${tx.name}" on ${new Date(tx.date).toLocaleDateString()}.`;
    },

    getTopRecipient: async (userId: string) => {
        const top = await getTopRecipient({ userId });

        if (!top) return "You haven't sent money to anyone yet.";

        return `You most frequently sent money to ${top.name} (${top.count} times).`;
    },

    getUserBanks: async (userId: string) => {
        const banks = await getBanko({ userId });

        if (!banks?.length) return "You have no banks linked.";

        return `You have ${banks.length} linked bank(s): ${banks.map(b => b.name).join(', ')}.`;
    },

    getBalance: async (userId: string) => {
        const balance = await getBalance({ userId });
        return `Your current total balance is ${balance} USD.`;
    },
};