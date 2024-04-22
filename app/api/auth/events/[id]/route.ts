import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse, ResponseLimit } from "next";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return NextResponse.json({ message }, { status: 500 });
};

export async function GET(req: Request) {
  const eventId = req.url?.split("/").pop();
  const session = await getServerSession();

  const userEmail = session?.user?.email;

  try {
    const result = await sql`
      SELECT * FROM events WHERE user_email = ${userEmail} AND event_id = ${eventId};
    `;

    const events = result.rows;

    console.log(events);

    if (result.rows.length > 0) {
      return NextResponse.json(
        {
          message: "events list success get",
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
    console.error("Error fetching event:", error);
    return NextResponse.json({
      message: "Error getting event listsss",
    });
  }
}

export async function PUT(req: Request) {
  const eventId = req.url.split("/").pop();
  const data = await req.json();
  const { event } = data;
  console.log(event);
  const session = await getServerSession();
  const userEmail = session?.user?.email;

  try {
    const existingEvent = await sql`
      SELECT * FROM events
      WHERE user_email = ${userEmail} AND title = ${event.title} AND description = ${event.description} AND start_date = ${event.startDate} AND end_date = ${event.endDate} AND color = ${event.color}
    `;

    console.log(existingEvent.rows);

    if (existingEvent.rows.length > 0) {
      return NextResponse.json(
        { message: "Event already exist's " },
        { status: 400 }
      );
    }

    const updateResponse = await sql`
      UPDATE events
      SET
        title = ${event.title},
        description = ${event.description},
        color = ${event.color},
        start_date = ${event.start},
        end_date = ${event.end}
      WHERE
        user_email = ${userEmail} AND
        event_id = ${eventId};
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
