import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import {v4 as uuidv4} from 'uuid';
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
 
  export async function POST(req: NextRequest) {
    const {notes,seletedDoctor}=await req.json();
    try{
      const sessionId=uuidv4()
      const user=await currentUser()
      const result= await db.insert(SessionChatTable).values({
        sessionId:sessionId,
        createdBy:user?.primaryEmailAddress?.emailAddress,
        notes:notes,
        seletedDoctor:seletedDoctor,
        createdOn:(new Date()).toISOString(),
    //@ts-ignore  
    }).returning({SessionChatTable})
    return NextResponse.json(result[0]?.SessionChatTable);
    }catch(e){
        return NextResponse.json(e)
    }
  }

  export async function GET(req:NextRequest) {
    const {searchParams}=new URL(req.url);
    const sessionId=searchParams.get('sessionId');
    const result=await db.select().from(SessionChatTable)
    //@ts-ignore
    .where(eq(SessionChatTable.sessionId, sessionId))
    return NextResponse.json(JSON.parse(JSON.stringify(result[0])));
  }