import TotalBalanceBox from '@/components/TotalBalanceBox';
import HeaderBox from '@/components/HeaderBox'
import React from 'react'
import RightSidebar from '@/components/RightSidebar';

const Home = () => {

    const loggedIn = { firstName: "Youssef" , lastName: "Oubenhamou" , email: "oubenhamouyoussef12@gmail.com" };
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
                        accounts={[]}
                        totalBanks={1}
                        totalCurrentBalance={1250.35}
                    />
                    
                </header>
                RECENT
            </div>
            <RightSidebar
                user={loggedIn}
                transactions={[]}
                banks={[{currentBalance: 123.50} , {currentBalance: 500.23}]}
            />
        </section>
    )
}

export default Home
