import TotalBalanceBox from '@/components/TotalBalanceBox';
import HeaderBox from '@/components/HeaderBox'
import React from 'react'
import RightSidebar from '@/components/RightSidebar';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import RecentTransactions from '@/components/RecentTransactions';

const Home = async (props: SearchParamProps) => {
    const searchParams = await props.searchParams;

    const {
        id,
        page
    } = searchParams;

    const loggedIn = await getLoggedInUser();

    const accounts = await getAccounts({ userId: loggedIn?.$id });

    if (!accounts) return;

    const accountsData = accounts?.data;

    const appwriteItemId = (id as string) || accounts?.data[0]?.appwriteItemId;

    const account = await getAccount({ appwriteItemId });

    return (
        <section className="home">
            <div className="home-content">
                <header className="home-header">

                    <HeaderBox
                        type="greeting"
                        title="welcome"
                        user={ loggedIn?.firstName || "Guest" }
                        subtext="Access and mangage your account and transactions efficiently"
                    />
                    <TotalBalanceBox 
                        accounts={accounts?.data}
                        totalBanks={accounts?.totalBanks}
                        totalCurrentBalance={accounts?.totalCurrentBalance}
                    />
                    
                </header>
                <RecentTransactions 
                    accounts={accountsData}
                    transactions={account?.transactions}
                    appwriteItemId={appwriteItemId}
                    page={4}
                />
            </div>
            <RightSidebar
                user={loggedIn}
                transactions={accounts?.transactions}
                banks={accountsData}
            />
        </section>
    )
}

export default Home
