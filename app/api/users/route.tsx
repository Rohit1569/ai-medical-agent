import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const user=await currentUser();
        console.log(req);
        
    try{
     const users=await db.select().from(usersTable)
     .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress || ""))

     if(!users?.length){
      const res=await db.insert(usersTable).values({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        name:user?.fullName ,
        email:user?.primaryEmailAddress?.emailAddress,
        credits:10
         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
         //@ts-expect-error
      }).returning({usersTable});
      return NextResponse.json(res[0]?.userTable);
     }
     return NextResponse.json(users[0]);
    }
    catch(e){
      return NextResponse.json(e)
    }
    
}
