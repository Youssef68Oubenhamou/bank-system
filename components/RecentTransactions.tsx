import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankTabItem } from "./BankTabItem"
import BankInfo from "./BankInfo"
import TransactionsTable from './TransactionsTable'
import { Pagination } from './Pagination'

const RecentTransactions = ({
    accounts,
    transactions=[],
    appwriteItemId,
    page = 1,
}: RecentTransactionsProps) => {
    const rowsPerPage = 10;
    const totalPages = Math.ceil(transactions.length / rowsPerPage);

    const indexOfLastTransaction = page * rowsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
    // let transactionSlices = [];
    // let aSlice = [];
    // for (let i = 0; i < totalPages; i++) {

    //     for (let j = 0; j < rowsPerPage; j++) {

    //         aSlice.push(transactions[j]);

    //     }
    //     transactionSlices.push(aSlice);
    //     aSlice = [];

    // }

    const currentTransactions = transactions.slice(
        indexOfFirstTransaction, indexOfLastTransaction
    )

    return (
        <section className="recent-transactions">
            <header className="flex items-center justify-between">
                <h2 className="recent-transactions-label">Recent transactions</h2>
                <Link
                href={`/transaction-history/?id=${appwriteItemId}`}
                className="view-all-btn"
                >
                View all
                </Link>
            </header>

            <Tabs defaultValue={appwriteItemId} className="w-full">
                <TabsList className="recent-transactions-tablist">
                    {accounts.map((account: Account) => (
                        <TabsTrigger key={account.id} value={account.appwriteItemId}>
                            <BankTabItem
                                key={account.id}
                                account={account}
                                appwriteItemId={appwriteItemId}
                            />
                        </TabsTrigger>
                    ))}
                </TabsList>

                {
                accounts.map((account: Account) => (
                <TabsContent
                    value={account.appwriteItemId}
                    key={account.id}
                    className="space-y-4"
                >
                    <BankInfo 
                        account={account}
                        appwriteItemId={appwriteItemId}
                        type="full"
                    />

                    <TransactionsTable transactions={currentTransactions} />
                    
                    <Pagination totalPages={totalPages} page={page} />
                    
                </TabsContent>
                ))
                }
            </Tabs>
        </section>
    )
}

export default RecentTransactions
