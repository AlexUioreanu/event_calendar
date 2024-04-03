import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { Event } from "@/types";
import { getSession } from "next-auth/react";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return NextResponse.json({ message }, { status: 500 });
};
export async function PUT(req: Request) {
  const data = await req.json();
  const { event } = data;
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  try {
    const existingEvent = await sql`
      SELECT * FROM events
      WHERE user_email = ${userEmail} AND title = ${event.title} AND description = ${event.description} AND start_date = ${event.startDate} AND end_date = ${event.endDate} AND color = ${event.color}
    `;

    if (existingEvent.rows.length > 0) {
      return NextResponse.json(
        { message: "Event already exist's " },
        { status: 400 }
      );
    }

    const updateResponse = await sql`
  INSERT INTO events (title, description, color, user_email, start_date, end_date)
  VALUES (${event.title}, ${event.description}, ${event.color}, ${userEmail}, ${event.start}, ${event.end})
`;

    if (updateResponse.rowCount > 0) {
      return NextResponse.json({ message: "Event updated successfully" });
    } else {
      return NextResponse.json(
        { message: "Event update failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleError(error, "Error updating event");
  }
}

export async function POST(req: Request, res: Response) {
  const data = await req.json();
  const { event } = data;
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  try {
    // Insert logic here
    const result = await sql`
      INSERT INTO events (title, description, color, user_email, start_date, end_date)
      VALUES (${event.title}, ${event.description}, ${event.color}, ${userEmail}, ${event.start}, ${event.end})
      RETURNING *;
    `;

    if (result.rowCount > 0) {
      return NextResponse.json({ message: "Event updated successfully" });
    } else {
      return NextResponse.json(
        { message: "Event update failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleError(error, "Error updating event");
  }
}

export async function DELETE(request: Request, res: NextApiResponse) {
  const { movieId } = await request.json();
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  try {
    const updateResponse = await sql`
     DELETE FROM user_favorites WHERE user_email = ${userEmail} AND movie_id = ${movieId} ;
    `;

    if (updateResponse.rowCount > 0) {
      return NextResponse.json({ message: "Favorite removed successfully" });
    } else {
      return NextResponse.json(
        { message: "Favorite not found or failed to remove" },
        { status: 404 }
      );
    }
  } catch (error) {
    return handleError(error, "Error removing favorite");
  }
}
export const GET = async (req: Request, res: Response) => {
  const session = await getServerSession();

  const userEmail = session?.user?.email;

  try {
    const result = await sql`
      SELECT * FROM events WHERE user_email = ${userEmail}
    `;
    const events = result.rows;

    if (events.length > 0) {
      return NextResponse.json(
        {
          message: "Favorite list success get",
          events,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Error getting favorite list",
          data: events,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error getting events list:", error);
    return NextResponse.json({
      message: "Error getting event listsss",
    });
  }
};
