import React from 'react'
import { Link } from 'react-router-dom'

const navLink = {
    admin: ["Home", "About", "Contact"],
    fieldOfficer: ["About"],
    receptionist: ["Contact"]
};
const role = "admin"
const Navbar = () => {
    return (
        <div className="bg-white w-screen min-h-20 text-black">
            <nav className="flex gap-6 p-4">
                {navLink[role]?.map((item) => (
                    <div key={item} className="cursor-pointer">
                        {item}
                    </div>

                ))}
            </nav>
        </div>
    )
}

export default Navbar