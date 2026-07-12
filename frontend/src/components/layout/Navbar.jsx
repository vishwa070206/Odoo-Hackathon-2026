import { Bell, Search, UserCircle2 } from "lucide-react";

function Navbar() {

    return (

        <header className="flex h-20 items-center justify-between border-b bg-white px-8">

            <div className="relative">

                <Search
                    className="absolute left-4 top-3 text-gray-400"
                    size={18}
                />

                <input
                    placeholder="Search..."
                    className="w-80 rounded-xl border py-2 pl-10 pr-4 outline-none"
                />

            </div>

            <div className="flex items-center gap-6">

                <Bell className="cursor-pointer"/>

                <UserCircle2 size={36}/>

            </div>

        </header>

    );

}

export default Navbar;