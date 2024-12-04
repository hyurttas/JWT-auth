import { getUserFromCookie } from "@/actions/decode"

export default async  function Page(){
  const id = await getUserFromCookie()
  console.log(id);
  
  return(
    <div>
      <h1>Home</h1>
    </div>
  )
}