import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";
import Link from "next/link"; 

const menuOptions = [
  {
    id: 1,
    name: "Home",
    path: "/dashboard",
  },
  {
    id: 2,
    name: "History",
    path: "/dashboard/history",
  },
  // {
  //   id: 3,
  //   name: "Pricing",
  //   path: "/dashboard/billing",
  // },
//   {
//     id: 4,
//     name: "Profile",
//     path: "/profile",
//   },
];

function AppHeader() {
  return (
    <div className="flex justify-between items-center bg-gray-800 text-white shadow p-4 px-10 md:px-20 lg:px-40">
      <Image src={"logo.svg"} alt="logo" width={60} height={50} />
      <div className="flex gap-12 items-center">
        {menuOptions.map((option) => (
          <Link href={option.path} key={option.id}>
            <h2 className="hover:font-bold cursor-pointer">{option.name}</h2>
          </Link>
        ))}
      </div>
      <UserButton />
    </div>
  );
}

export default AppHeader;
