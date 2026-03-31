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
        <>
            <iframe 
                src="http://localhost:3000/captcha?embed=true"
                width={400}
                height={600}
            />
            {success && (
                <div>YOU CAN NOW SEE THE PAGE</div>
            )}
        </>
    )
}