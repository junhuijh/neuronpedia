"use client"
import { useEffect, useState } from "react"

export default function Page(){
    const [success, setSuccess] = useState<boolean>(false)
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data.verified) {
                setSuccess(true)
            }
        }
        window.addEventListener("message", handler)
        return () => window.removeEventListener("message", handler)
    }, [])

    return (
        <div className="flex w-full h-full items-center justify-center">
            {!success && (
                <iframe 
                    className=""
                    src={`${process.env.NEXT_PUBLIC_APP_URL}/captcha?embed=true`}
                    width={400}
                    height={600}
                />
            )}
            {success && (
                <div>YOU CAN NOW SEE THE PAGE</div>
            )}
        </div>
    )
}