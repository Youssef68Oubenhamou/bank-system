import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import BankCard from './BankCard'

const RightSidebar = ({ user ,transactions , banks }: RightSidebarProps) => {
    return (
        <aside className="right-sidebar">
            <section className="flex flex-col pb-8">
                <div className="profile-banner">
                    <div className="profile">
                        <div className="profile-img mt-16">
                            <span className="text-5xl font-bold text-blue-500">
                                {user && user.firstName[0]}
                            </span>
                        </div>
                        <div className="profile-details mt-9">
                            <h1>
                                {user && user.firstName}
                            </h1>
                            <p className="profile-email">
                                {user && user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="banks">
                <div className="flex w-full justify-between">
                    <h2 className="header-2">
                        MyBanks
                    </h2>
                </div>
                {

                    banks?.length > 0 && (

                        <div className="relative flex flex-1 flex-col items-center justify-center gap-5">

                            <div className="relative z-10 w-[90%]">
                                <BankCard
                                    key={banks[0].$id}
                                    account={banks[0]}
                                    userName={`${user?.firstName} ${user?.lastName}`}
                                    showBalance={false}
                                />
                            </div>
                            {

                                banks[1] && (
                                    <div className="absolute right-0 top-8 z-0 w-[90%]">
                                        <BankCard
                                            key={banks[1].$id}
                                            account={banks[1]}
                                            userName={`${user?.firstName} ${user?.lastName}`}
                                            showBalance={false}
                                        />
                                    </div>
                                )

                            }

                        </div>

                    )

                }
            </section>

        </aside>
    )
}

export default RightSidebar
