import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import {v4 as uuidv4} from 'uuid';
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
 
  export async function POST(req: NextRequest) {
    const {notes,selectedDoctor}=await req.json();
    try{
      const sessionId=uuidv4()
      const user=await currentUser()
      const result= await db.insert(SessionChatTable).values({
        sessionId:sessionId,
        createdBy:user?.primaryEmailAddress?.emailAddress,
        notes:notes,
        selectedDoctor:selectedDoctor,
        createdOn:(new Date()).toISOString(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error  
    }).returning({SessionChatTable})
    return NextResponse.json(result[0]?.SessionChatTable);
    }catch(e){
        return NextResponse.json(e)
    }
  }

  export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;
  
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
  
    if (sessionId === "all") {
      // Get total count
      const allSessions = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, userEmail || ""));
      const total = allSessions.length;
  
      // Get paginated results
      const result = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, userEmail || ""))
        .orderBy(desc(SessionChatTable.id))
        .limit(limit)
        .offset(offset);
  
      return NextResponse.json({
        data: JSON.parse(JSON.stringify(result)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } else {
      const result = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.sessionId, sessionId || ""));
      return NextResponse.json(JSON.parse(JSON.stringify(result)));
    }
  }
  