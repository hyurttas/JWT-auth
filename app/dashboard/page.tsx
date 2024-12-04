import { getUserFromCookie } from "@/actions/decode";

export default async function Page() {
    const user = await getUserFromCookie()
    console.log(user);
    
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}