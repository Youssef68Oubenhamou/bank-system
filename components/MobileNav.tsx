"use client"

import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import Link from 'next/link'
import { sidebarLinks } from '@/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const MobileNav = ({ user }: MobileNavProps) => {

    const pathname = usePathname();

    return (
        <section className="w-full max-w-[264px]">
            
            <Sheet>
                <SheetTrigger>
                    <Image src="/icons/hamburger.svg"
                        width={30}
                        height={30}
                        alt="menu"
                        className="cursor-pointer"
                    />
                </SheetTrigger>
                <SheetContent side="left">
                    <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
                        <Image
                            src="/icons/mastercard.svg"
                            width={34}
                            height={34}
                            alt="YouX Logo"
                            className="size-[24px] max-xl:size-14"
                        />
                        <h1 className="sidebar-logo">YouX Bank</h1>
                    </Link>
                    {

                        sidebarLinks.map((item) => {

                            const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

                            return (

                                <Link href={item.route} key={item.label} className={cn("sidebar-link" , {"bg-blue-500": isActive})}>
                                    <div className="relative size-6">
                                        <Image
                                            src={item.imgURL}
                                            alt={item.label}
                                            fill
                                            className={cn({

                                                "brightness-[3] invert-0": isActive

                                            })}
                                        />
                                    </div>
                                    <p className={cn("sidebar-label" , { "!text-white": isActive })}>
                                        {item.label}
                                    </p>
                                </Link>

                            )

                        })

                    }
                </SheetContent>
            </Sheet>

        </section>
    )
}

export default MobileNav
