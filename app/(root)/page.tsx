import TotalBalanceBox from '@/components/TotalBalanceBox';
import HeaderBox from '@/components/HeaderBox'
import React from 'react'

const Home = () => {

    const loggedIn = { firstName: "Youssef" };
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
            </div>
        </section>
    )
}

export default Home
