import { db } from "@/config/db";
import { SessionChatTable, usersTable } from "@/config/schema";
import {v4 as uuidv4} from 'uuid';
import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { DEMO_USER, getUserEmail, isDemoMode } from "@/lib/demo-auth";
 
  export async function POST(req: NextRequest) {
    const {notes,selectedDoctor}=await req.json();
    try{
      const sessionId=uuidv4()
      const userEmail = await getUserEmail();
      if (!userEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (isDemoMode()) {
        await db.insert(usersTable).values({
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          credits: 10,
        }).onConflictDoNothing({ target: usersTable.email });
      }

      const result= await db.insert(SessionChatTable).values({
        sessionId:sessionId,
        createdBy:userEmail,
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
  
    const userEmail = await getUserEmail();
  
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
  