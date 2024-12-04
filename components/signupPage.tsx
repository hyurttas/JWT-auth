'use client'

import { useState } from "react"

export default function SignUp(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    return(
       <form className={`
            flex 
            flex-col
            gap-4
       `} action='#'>
        <input type="email" name="password" id=""  onChange={(e)=>setEmail(e.target.value)}/>
        <input type="password" name="password" id="" onChange={(e)=>setPassword(e.target.value)} />
        <button>submit</button>
       </form>
    )
}